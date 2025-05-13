const username = localStorage.getItem("loggedInUser") || "User"

document.querySelectorAll(".username-placeholder").forEach((el) => {
  el.textContent = username
})

// Check login status
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "index.html" 
}

document.querySelector(".dropdown-item").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.clear()

  window.location.href = "index.html"
})

// Page navigation functionality
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".sidebar a[data-page]")

  const notificationState = {
    notifications: [],
    unreadCount: 0,
    lastChecked: localStorage.getItem("lastNotificationCheck") || 0,
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const pageToShow = this.getAttribute("data-page")

      document.querySelectorAll(".page-section").forEach((section) => {
        section.classList.remove("active-section")
      })

      // Show the selected page section
      const targetSection = document.getElementById(`${pageToShow}-page`)
      if (targetSection) {
        targetSection.classList.add("active-section")

        if (pageToShow === "dashboard") {
          loadNotifications()
          updateNotificationBadge(0)
        } else if (pageToShow === "ledger") {
          loadPaymentHistory()
        } else if (pageToShow === "airline") {
          loadTickets()
        } else if (pageToShow === "bookings") {
          loadBookings()
        }
      }

      navLinks.forEach((navLink) => {
        navLink.classList.remove("active")
      })
      this.classList.add("active")
    })
  })

  // Initialize Bootstrap modals
  const paymentModalElement = document.getElementById("paymentModal")
  const bookingModalElement = document.getElementById("bookingModal")
  let paymentModal, bookingModal

  if (typeof bootstrap !== "undefined") {
    paymentModal = new bootstrap.Modal(paymentModalElement)
    bookingModal = new bootstrap.Modal(bookingModalElement)
  } else {
    console.error("Bootstrap is not loaded properly")
  }

  // Payment Modal Functionality
  const postPaymentBtn = document.getElementById("postPaymentBtn")
  if (postPaymentBtn) {
    postPaymentBtn.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0]
      document.getElementById("paymentDate").value = today

      document.getElementById("paymentForm").reset()
      document.getElementById("paymentDate").value = today

      const messageEl = document.getElementById("paymentMessage")
      messageEl.classList.add("d-none")

      // Show modal
      if (paymentModal) {
        paymentModal.show()
      } else {
        paymentModalElement.style.display = "block"
      }
    })
  }

  // Submit payment
  const submitPaymentBtn = document.getElementById("submitPayment")
  if (submitPaymentBtn) {
    submitPaymentBtn.addEventListener("click", () => {
      const name = document.getElementById("paymentName").value.trim()
      const amount = document.getElementById("paymentAmount").value
      const date = document.getElementById("paymentDate").value
      const status = document.getElementById("paymentStatus").value

      const messageEl = document.getElementById("paymentMessage")

      // Validate form
      if (!name || !amount || !date) {
        messageEl.textContent = "Please fill in all required fields."
        messageEl.classList.remove("d-none", "alert-success")
        messageEl.classList.add("alert-danger")
        return
      }

      console.log("Submitting payment:", { name, amount, date, status })

      // Submit payment to API
      fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          amount,
          date,
          status,
          username,
        }),
      })
        .then((response) => {
          console.log("Payment response status:", response.status)
          if (!response.ok) {
            return response.text().then((text) => {
              console.log("Error response text:", text)
              try {
                return Promise.reject(JSON.parse(text))
              } catch (e) {
                return Promise.reject({ error: text })
              }
            })
          }
          return response.json()
        })
        .then((data) => {
          console.log("Payment success:", data)

          messageEl.textContent = "Payment posted successfully!"
          messageEl.classList.remove("d-none", "alert-danger")
          messageEl.classList.add("alert-success")

          loadPaymentHistory()

          setTimeout(() => {
            if (paymentModal) {
              paymentModal.hide()
            } else {
              paymentModalElement.style.display = "none"
            }
          }, 1500)
        })
        .catch((error) => {
          console.error("Payment error:", error)
          messageEl.textContent = `Error: ${error.message || error.error || "Unknown error"}`
          messageEl.classList.remove("d-none", "alert-success")
          messageEl.classList.add("alert-danger")
        })
    })
  }

  // Function to load payment history
  function loadPaymentHistory() {
    const tableBody = document.getElementById("payment-history-table")
    if (!tableBody) return

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading payment history...</td></tr>'

    fetch(`/api/payments?username=${username}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.log("Error response text:", text)
            try {
              // Try to parse as JSON
              return Promise.reject(JSON.parse(text))
            } catch (e) {
              // If not JSON, return the text
              return Promise.reject({ error: text })
            }
          })
        }
        return response.json()
      })
      .then((payments) => {
        console.log("Payments received:", payments)

        if (payments.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No payment history found.</td></tr>'
          return
        }

        tableBody.innerHTML = ""
        payments.forEach((payment, index) => {
          const paymentDate = new Date(payment.date).toLocaleDateString()

          // Create status badge
          let statusBadgeClass = "bg-warning"
          if (payment.status === "Completed") {
            statusBadgeClass = "bg-success"
          } else if (payment.status === "Failed") {
            statusBadgeClass = "bg-danger"
          }

          // Format amount
          const formattedAmount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PKR",
          }).format(payment.amount)

          tableBody.innerHTML += `
            <tr>
              <td>${index + 1}</td>
              <td>${payment.name}</td>
              <td>${formattedAmount}</td>
              <td>${paymentDate}</td>
              <td><span class="badge ${statusBadgeClass}">${payment.status}</span></td>
            </tr>
          `
        })
      })
      .catch((error) => {
        console.error("Error loading payments:", error)
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading payment history: ${
          error.message || error.error || "Unknown error"
        }</td></tr>`
      })
  }

  function updateNotificationBadge(count) {
    const badge = document.getElementById("notification-badge")
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count
        badge.classList.remove("d-none")
      } else {
        badge.classList.add("d-none")
      }
      notificationState.unreadCount = count
    }
  }


  // Function to check for new notifications
  function checkForNewNotifications() {
    const lastChecked = notificationState.lastChecked

    fetch(`/api/payments/notifications?username=${username}&since=${lastChecked}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch new notifications")
        }
        return response.json()
      })
      .then((newNotifications) => {
        if (newNotifications.length > 0) {
          // Update unread count
          updateNotificationBadge(notificationState.unreadCount + newNotifications.length)

          if (document.getElementById("dashboard-page").classList.contains("active-section")) {
            loadNotifications()
          }
        }

        notificationState.lastChecked = Date.now()
        localStorage.setItem("lastNotificationCheck", notificationState.lastChecked)
      })
      .catch((error) => {
        console.error("Error checking for new notifications:", error)
      })
  }

  // Function to load notifications (completed or failed payments)
  function loadNotifications() {
    const notificationsArea = document.getElementById("notifications-area")
    if (!notificationsArea) return

    const activeFilter =
      document.querySelector(".notification-controls .btn-group .active").getAttribute("data-filter") || "all"
    let url = `/api/payments/notifications?username=${username}`

    if (activeFilter !== "all") {
      url += `&status=${activeFilter}`
    }

    fetch(url)
      .then((response) => {
        console.log("Notifications response status:", response.status)
        if (!response.ok) {
          return response.text().then((text) => {
            console.log("Error response text:", text)
            try {
              return Promise.reject(JSON.parse(text))
            } catch (e) {
              return Promise.reject({ error: text })
            }
          })
        }
        return response.json()
      })
      .then((payments) => {

        // Store notifications in state
        notificationState.notifications = payments

        console.log("Last checked time:", notificationState.lastChecked)
        console.log("Current time:", Date.now())
        notificationState.lastChecked = Date.now()
        localStorage.setItem("lastNotificationCheck", notificationState.lastChecked)

        updateNotificationBadge(0)

        if (payments.length === 0) {
          notificationsArea.innerHTML = '<div class="text-center">No notifications at this time.</div>'
          return
        }

        notificationsArea.innerHTML = ""
        payments.forEach((payment) => {
          // Format amount
          const formattedAmount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PKR",
          }).format(payment.amount)

          const statusClass = payment.status === "Completed" ? "success" : "danger"
          const icon = payment.status === "Completed" ? "check-circle" : "times-circle"

          notificationsArea.innerHTML += `
            <div class="notification-item mb-2 p-3 border-start border-${statusClass} border-3 bg-dark rounded" data-id="${payment._id}" data-status="${payment.status.toLowerCase()}">
              <div class="d-flex align-items-center">
                <i class="fas fa-${icon} text-${statusClass} me-2"></i>
                <div class="flex-grow-1">
                  <p class="mb-0" style="padding-top:20px">Payment of ${formattedAmount} has been ${payment.status.toLowerCase()}</p>
                  <small class="text-muted">${new Date(payment.date).toLocaleString()}</small>
                </div>
              </div>
            </div>
          `
        })

      })
      .catch((error) => {
        console.error("Error loading notifications:", error)
        notificationsArea.innerHTML = `
          <div class="text-center text-danger">
            <p>Error loading notifications: ${error.message || error.error || "Unknown error"}</p>
          </div>
        `
      })
  }

  // Set up notification filter buttons
  document.querySelectorAll(".notification-controls .btn-group button").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".notification-controls .btn-group button").forEach((b) => {
        b.classList.remove("active")
      })

      this.classList.add("active")

      loadNotifications()
    })
  })

  document.getElementById("clear-all-notifications").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      const notificationsArea = document.getElementById("notifications-area")

      document.querySelectorAll(".notification-item").forEach((item) => {
        item.classList.add("fade-out")
      })

      setTimeout(() => {
        notificationsArea.innerHTML = '<div class="text-center text-muted">No notifications at this time.</div>'
      }, 300)

      updateNotificationBadge(0)
    }
  })

  function loadTickets() {
    const ticketsContainer = document.getElementById("tickets-container")
    if (!ticketsContainer) return

    ticketsContainer.innerHTML = `
      <div class="col-12 text-center text-white">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading available flights...</p>
      </div>
    `


    fetch("/api/tickets")
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              return Promise.reject(JSON.parse(text))
            } catch (e) {
              return Promise.reject({ error: text })
            }
          })
        }
        return response.json()
      })
      .then((tickets) => {

        if (tickets.length === 0) {
          ticketsContainer.innerHTML = `
            <div class="col-12 text-center text-white">
              <p>No flights available at the moment. Please check back later.</p>
            </div>
          `
          return
        }

        ticketsContainer.innerHTML = ""
        tickets.forEach((ticket) => {
          const departureDate = new Date(ticket.departure.date).toLocaleDateString()
          const arrivalDate = new Date(ticket.arrival.date).toLocaleDateString()

          const formattedPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PKR",
          }).format(ticket.price)

          let availabilityBadge = `<span class="badge bg-success">Available (${ticket.availableSeats} seats)</span>`
          if (ticket.availableSeats <= 5) {
            availabilityBadge = `<span class="badge bg-warning">Limited (${ticket.availableSeats} seats)</span>`
          }
          if (ticket.availableSeats === 0) {
            availabilityBadge = `<span class="badge bg-danger">Sold Out</span>`
          }

          ticketsContainer.innerHTML += `
            <div class="col-md-6 col-lg-4 mb-4">
              <div class="card bg-dark text-white h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">${ticket.airline}</h5>
                  <span class="badge bg-info">${ticket.class}</span>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <p class="mb-0 text-muted">Flight</p>
                      <p class="mb-0 fw-bold">${ticket.flightNumber}</p>
                    </div>
                    <div>
                      <p class="mb-0 text-muted">Price</p>
                      <p class="mb-0 fw-bold">${formattedPrice}</p>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <p class="mb-0 text-muted">From</p>
                      <p class="mb-0 fw-bold">${ticket.departure.city}</p>
                      <p class="mb-0">${departureDate}</p>
                      <p class="mb-0">${ticket.departure.time}</p>
                    </div>
                    <i class="fas fa-plane"></i>
                    <div>
                      <p class="mb-0 text-muted">To</p>
                      <p class="mb-0 fw-bold">${ticket.arrival.city}</p>
                      <p class="mb-0">${arrivalDate}</p>
                      <p class="mb-0">${ticket.arrival.time}</p>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div>${availabilityBadge}</div>
                    <button class="btn btn-primary book-ticket-btn" data-ticket-id="${ticket._id}" 
                      ${ticket.availableSeats === 0 ? "disabled" : ""}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `
        })

        document.querySelectorAll(".book-ticket-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            const ticketId = this.getAttribute("data-ticket-id")
            openBookingModal(ticketId)
          })
        })
      })
      .catch((error) => {
        console.error("Error loading tickets:", error)
        ticketsContainer.innerHTML = `
          <div class="col-12 text-center text-white">
            <p class="text-danger">Error loading flights: ${error.message || error.error || "Unknown error"}</p>
          </div>
        `
      })
  }

  // Function to open booking modal
  function openBookingModal(ticketId) {
    document.getElementById("bookingForm").reset()
    document.getElementById("ticketId").value = ticketId

    const messageEl = document.getElementById("bookingMessage")
    messageEl.classList.add("d-none")

    fetch(`/api/tickets/${ticketId}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              return Promise.reject(JSON.parse(text))
            } catch (e) {
              return Promise.reject({ error: text })
            }
          })
        }
        return response.json()
      })
      .then((ticket) => {
        const departureDate = new Date(ticket.departure.date).toLocaleDateString()
        const arrivalDate = new Date(ticket.arrival.date).toLocaleDateString()

        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PKR",
        }).format(ticket.price)

        document.getElementById("ticketDetails").innerHTML = `
          <h5 class="mb-3">Flight Details</h5>
          <div class="card bg-dark text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <div>
                  <p class="mb-0 text-muted">Airline</p>
                  <p class="mb-0 fw-bold">${ticket.airline}</p>
                </div>
                <div>
                  <p class="mb-0 text-muted">Flight</p>
                  <p class="mb-0 fw-bold">${ticket.flightNumber}</p>
                </div>
                <div>
                  <p class="mb-0 text-muted">Class</p>
                  <p class="mb-0 fw-bold">${ticket.class}</p>
                </div>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <div>
                  <p class="mb-0 text-muted">From</p>
                  <p class="mb-0 fw-bold">${ticket.departure.city}</p>
                  <p class="mb-0">${departureDate}, ${ticket.departure.time}</p>
                </div>
                <div>
                  <p class="mb-0 text-muted">To</p>
                  <p class="mb-0 fw-bold">${ticket.arrival.city}</p>
                  <p class="mb-0">${arrivalDate}, ${ticket.arrival.time}</p>
                </div>
              </div>
              <div class="text-center mt-2">
                <p class="mb-0 text-muted">Price</p>
                <p class="mb-0 fw-bold fs-5">${formattedPrice}</p>
              </div>
            </div>
          </div>
        `

        if (bookingModal) {
          bookingModal.show()
        } else {
          bookingModalElement.style.display = "block"
        }
      })
      .catch((error) => {
        console.error("Error loading ticket details:", error)
        alert("Error loading ticket details. Please try again.")
      })
  }

  // Confirm booking
  const confirmBookingBtn = document.getElementById("confirmBooking")
  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener("click", () => {
      const ticketId = document.getElementById("ticketId").value
      const passengerName = document.getElementById("passengerName").value.trim()
      const passengerEmail = document.getElementById("passengerEmail").value.trim()
      const passengerPhone = document.getElementById("passengerPhone").value.trim()

      const messageEl = document.getElementById("bookingMessage")

      if (!passengerName || !passengerEmail || !passengerPhone) {
        messageEl.textContent = "Please fill in all required fields."
        messageEl.classList.remove("d-none", "alert-success")
        messageEl.classList.add("alert-danger")
        return
      }

      fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          username,
          passengerName,
          passengerEmail,
          passengerPhone,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              try {
                return Promise.reject(JSON.parse(text))
              } catch (e) {
                return Promise.reject({ error: text })
              }
            })
          }
          return response.json()
        })
        .then((data) => {

          messageEl.textContent = "Booking confirmed successfully!"
          messageEl.classList.remove("d-none", "alert-danger")
          messageEl.classList.add("alert-success")

          setTimeout(() => {
            if (bookingModal) {
              bookingModal.hide()
            } else {
              bookingModalElement.style.display = "none"
            }

            loadTickets()
            loadBookings()
          }, 1500)
        })
        .catch((error) => {
          console.error("Booking error:", error)
          messageEl.textContent = `Error: ${error.message || error.error || "Unknown error"}`
          messageEl.classList.remove("d-none", "alert-success")
          messageEl.classList.add("alert-danger")
        })
    })
  }

  // Function to load bookings
  function loadBookings() {
    const bookingsContainer = document.getElementById("bookings-container")
    if (!bookingsContainer) return

    bookingsContainer.innerHTML = `
      <div class="col-12 text-center text-white">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading your bookings...</p>
      </div>
    `

    fetch(`/api/bookings/user/${username}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              return Promise.reject(JSON.parse(text))
            } catch (e) {
              return Promise.reject({ error: text })
            }
          })
        }
        return response.json()
      })
      .then((bookings) => {

        if (bookings.length === 0) {
          bookingsContainer.innerHTML = `
            <div class="col-12 text-center text-white">
              <p>You don't have any bookings yet. Go to the Airline section to book a flight.</p>
            </div>
          `
          return
        }

        bookingsContainer.innerHTML = ""
        bookings.forEach((booking) => {
          const ticket = booking.ticketId

          const bookingDate = new Date(booking.bookingDate).toLocaleDateString()
          const departureDate = new Date(ticket.departure.date).toLocaleDateString()
          const arrivalDate = new Date(ticket.arrival.date).toLocaleDateString()

          let statusBadgeClass = "bg-success"
          if (booking.status === "Pending") {
            statusBadgeClass = "bg-warning"
          } else if (booking.status === "Cancelled") {
            statusBadgeClass = "bg-danger"
          }

          bookingsContainer.innerHTML += `
            <div class="col-md-6 mb-4">
              <div class="card bg-dark text-white">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">${ticket.airline} - ${ticket.flightNumber}</h5>
                  <span class="badge ${statusBadgeClass}">${booking.status}</span>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <p class="mb-0 text-muted">Passenger</p>
                    <p class="mb-0 fw-bold">${booking.passengerName}</p>
                    <p class="mb-0">${booking.passengerEmail}</p>
                    <p class="mb-0">${booking.passengerPhone}</p>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <p class="mb-0 text-muted">From</p>
                      <p class="mb-0 fw-bold">${ticket.departure.city}</p>
                      <p class="mb-0">${departureDate}</p>
                      <p class="mb-0">${ticket.departure.time}</p>
                    </div>
                    <i class="fas fa-plane"></i>
                    <div>
                      <p class="mb-0 text-muted">To</p>
                      <p class="mb-0 fw-bold">${ticket.arrival.city}</p>
                      <p class="mb-0">${arrivalDate}</p>
                      <p class="mb-0">${ticket.arrival.time}</p>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="mb-0 text-muted">Booking Date</p>
                      <p class="mb-0">${bookingDate}</p>
                    </div>
                    <div>
                      <p class="mb-0 text-muted">Price</p>
                      <p class="mb-0 fw-bold">${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "PKR",
                      }).format(booking.price || ticket.price)}</p>
                    </div>
                    ${
                      booking.status !== "Cancelled"
                        ? `<button class="btn btn-danger cancel-booking-btn" data-booking-id="${booking._id}">
                            Cancel Booking
                          </button>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            </div>
          `
        })

        // Add event listeners to cancel buttons
        document.querySelectorAll(".cancel-booking-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            if (confirm("Are you sure you want to cancel this booking?")) {
              const bookingId = this.getAttribute("data-booking-id")
              cancelBooking(bookingId)
            }
          })
        })
      })
      .catch((error) => {
        console.error("Error loading bookings:", error)
        bookingsContainer.innerHTML = `
          <div class="col-12 text-center text-white">
            <p class="text-danger">Error loading bookings: ${error.message || error.error || "Unknown error"}</p>
          </div>
        `
      })
  }

  // Function to cancel booking
  function cancelBooking(bookingId) {
    fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              return Promise.reject(JSON.parse(text))
            } catch (e) {
              return Promise.reject({ error: text })
            }
          })
        }
        return response.json()
      })
      .then((data) => {
        alert("Booking cancelled successfully.")

        loadBookings()
        loadTickets()
      })
      .catch((error) => {
        console.error("Error cancelling booking:", error)
        alert(`Error cancelling booking: ${error.message || error.error || "Unknown error"}`)
      })
  }

  if (document.getElementById("dashboard-page")?.classList.contains("active-section")) {
    loadNotifications()
  } else if (document.getElementById("ledger-page")?.classList.contains("active-section")) {
    loadPaymentHistory()
  } else if (document.getElementById("airline-page")?.classList.contains("active-section")) {
    loadTickets()
  } else if (document.getElementById("bookings-page")?.classList.contains("active-section")) {
    loadBookings()
  }

  setInterval(checkForNewNotifications, 30000)
})

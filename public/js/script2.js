// Get username from localStorage
const username = localStorage.getItem("loggedInUser") || "User"

// Update places where username is shown
document.querySelectorAll(".username-placeholder").forEach((el) => {
  el.textContent = username
})

// Check login status
if (localStorage.getItem("isLoggedIn") !== "true") {
  // Not logged in, redirect to home page
  window.location.href = "index.html" // Change this to your home page file
}

document.querySelector(".dropdown-item").addEventListener("click", (e) => {
  e.preventDefault()

  // Clear localStorage
  localStorage.clear()

  // Redirect to home (index.html)
  window.location.href = "index.html"
})

// Page navigation functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get all sidebar navigation links
  const navLinks = document.querySelectorAll(".sidebar a[data-page]")

  // Add click event listener to each link
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Get the page to show from data-page attribute
      const pageToShow = this.getAttribute("data-page")

      // Hide all page sections
      document.querySelectorAll(".page-section").forEach((section) => {
        section.classList.remove("active-section")
      })

      // Show the selected page section
      const targetSection = document.getElementById(`${pageToShow}-page`)
      if (targetSection) {
        targetSection.classList.add("active-section")

        // Load data based on the page
        if (pageToShow === "ledger") {
          loadPaymentHistory()
        } else if (pageToShow === "airline") {
          loadTickets()
        } else if (pageToShow === "bookings") {
          loadBookings()
        }
      }

      // Highlight the active navigation link
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
      // Set default date to today
      const today = new Date().toISOString().split("T")[0]
      document.getElementById("paymentDate").value = today

      // Clear form
      document.getElementById("paymentForm").reset()
      document.getElementById("paymentDate").value = today

      // Hide any previous messages
      const messageEl = document.getElementById("paymentMessage")
      messageEl.classList.add("d-none")

      // Show modal
      if (paymentModal) {
        paymentModal.show()
      } else {
        // Fallback if bootstrap modal isn't available
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
        .then((data) => {
          console.log("Payment success:", data)

          // Show success message
          messageEl.textContent = "Payment posted successfully!"
          messageEl.classList.remove("d-none", "alert-danger")
          messageEl.classList.add("alert-success")

          // Reload payment history
          loadPaymentHistory()

          // Close modal after 1.5 seconds
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

    console.log("Fetching payment history for user:", username)

    fetch(`/api/payments?username=${username}`)
      .then((response) => {
        console.log("Payment history response status:", response.status)
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
          // Format date
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
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading payment history: ${error.message || error.error || "Unknown error"
          }</td></tr>`
      })
  }

  // Function to load tickets
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

    console.log("Fetching tickets...")

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
        console.log("Tickets received:", tickets)

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
          // Format dates
          const departureDate = new Date(ticket.departure.date).toLocaleDateString()
          const arrivalDate = new Date(ticket.arrival.date).toLocaleDateString()

          // Format price
          const formattedPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PKR",
          }).format(ticket.price)

          // Create availability badge
          let availabilityBadge = `<span class="badge bg-success">Available (${ticket.availableSeats} seats)</span>`
          if (ticket.availableSeats <= 5) {
            availabilityBadge = `<span class="badge bg-warning">Limited (${ticket.availableSeats} seats)</span>`
          }
          if (ticket.availableSeats === 0) {
            availabilityBadge = `<span class="badge bg-danger">Sold Out</span>`
          }

          // Create ticket card
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

        // Add event listeners to book buttons
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
    // Clear form
    document.getElementById("bookingForm").reset()
    document.getElementById("ticketId").value = ticketId

    // Hide any previous messages
    const messageEl = document.getElementById("bookingMessage")
    messageEl.classList.add("d-none")

    // Load ticket details
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
        // Format dates
        const departureDate = new Date(ticket.departure.date).toLocaleDateString()
        const arrivalDate = new Date(ticket.arrival.date).toLocaleDateString()

        // Format price
        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PKR",
        }).format(ticket.price)

        // Display ticket details in modal
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

        // Show modal
        if (bookingModal) {
          bookingModal.show()
        } else {
          // Fallback if bootstrap modal isn't available
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

      // Validate form
      if (!passengerName || !passengerEmail || !passengerPhone) {
        messageEl.textContent = "Please fill in all required fields."
        messageEl.classList.remove("d-none", "alert-success")
        messageEl.classList.add("alert-danger")
        return
      }

      console.log("Confirming booking:", { ticketId, passengerName, passengerEmail, passengerPhone })

      // Submit booking to API
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
          console.log("Booking success:", data)

          // Show success message
          messageEl.textContent = "Booking confirmed successfully!"
          messageEl.classList.remove("d-none", "alert-danger")
          messageEl.classList.add("alert-success")

          // Close modal after 1.5 seconds and reload tickets
          setTimeout(() => {
            if (bookingModal) {
              bookingModal.hide()
            } else {
              bookingModalElement.style.display = "none"
            }

            // Reload tickets and bookings
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
        console.log("Bookings received:", bookings)

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

          // Format dates
          const bookingDate = new Date(booking.bookingDate).toLocaleDateString()
          const departureDate = new Date(ticket.departure.date).toLocaleDateString()
          const arrivalDate = new Date(ticket.arrival.date).toLocaleDateString()

          // Create status badge
          let statusBadgeClass = "bg-success"
          if (booking.status === "Pending") {
            statusBadgeClass = "bg-warning"
          } else if (booking.status === "Cancelled") {
            statusBadgeClass = "bg-danger"
          }

          // Create booking card
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
                    ${booking.status !== "Cancelled"
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
        console.log("Booking cancelled:", data)
        alert("Booking cancelled successfully.")

        // Reload bookings and tickets
        loadBookings()
        loadTickets()
      })
      .catch((error) => {
        console.error("Error cancelling booking:", error)
        alert(`Error cancelling booking: ${error.message || error.error || "Unknown error"}`)
      })
  }

  // Load data for active page on initial load
  if (document.getElementById("ledger-page")?.classList.contains("active-section")) {
    loadPaymentHistory()
  } else if (document.getElementById("airline-page")?.classList.contains("active-section")) {
    loadTickets()
  } else if (document.getElementById("bookings-page")?.classList.contains("active-section")) {
    loadBookings()
  }
})

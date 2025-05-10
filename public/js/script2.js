// Get username from localStorage
const username = localStorage.getItem("loggedInUser") || "User123"

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

        // If this is the ledger page, load payment history
        if (pageToShow === "ledger") {
          loadPaymentHistory()
        }
      }

      // Highlight the active navigation link
      navLinks.forEach((navLink) => {
        navLink.classList.remove("active")
      })
      this.classList.add("active")
    })
  })

  // Payment Modal Functionality
  const paymentModalElement = document.getElementById("paymentModal")
  let paymentModal

  // Initialize Bootstrap modal
  if (typeof bootstrap !== "undefined") {
    paymentModal = new bootstrap.Modal(paymentModalElement)
  } else {
    console.error("Bootstrap is not loaded properly")
  }

  // Open payment modal
  document.getElementById("postPaymentBtn").addEventListener("click", () => {
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

  // Submit payment
  document.getElementById("submitPayment").addEventListener("click", () => {
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
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
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

  // Function to load payment history
  function loadPaymentHistory() {
    const tableBody = document.getElementById("payment-history-table")
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading payment history...</td></tr>'

    console.log("Fetching payment history...")

    fetch("/api/payments")
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
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
            currency: "USD",
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
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading payment history: ${error.message || error.error || "Unknown error"}</td></tr>`
      })
  }

  // Load payment history if ledger page is active on initial load
  if (document.getElementById("ledger-page").classList.contains("active-section")) {
    loadPaymentHistory()
  }
})

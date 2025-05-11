const express = require("express")
const router = express.Router()
const Payment = require("../models/Payment")

// Create a payment
router.post("/", async (req, res) => {
  try {
    const { name, amount, date, status } = req.body

    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount are required." })
    }

    const newPayment = new Payment({
      name,
      amount: Number(amount), // Ensure amount is a number
      date: date || Date.now(),
      status: status || "Pending",
    })

    const savedPayment = await newPayment.save()
    res.status(201).json(savedPayment)
  } catch (err) {
    console.error("Payment creation error:", err)
    res.status(500).json({ error: "Server error. Please try again later.", message: err.message })
  }
})

// Get all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 })
    res.json(payments)
  } catch (err) {
    console.error("Payment fetch error:", err)
    res.status(500).json({ error: "Failed to retrieve payments.", message: err.message })
  }
})

// Update payment status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: "Status is required." })
    }

    const payment = await Payment.findByIdAndUpdate(req.params.id, { status }, { new: true })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." })
    }

    res.json(payment)
  } catch (err) {
    console.error("Payment update error:", err)
    res.status(500).json({ error: "Failed to update payment status.", message: err.message })
  }
})

module.exports = router

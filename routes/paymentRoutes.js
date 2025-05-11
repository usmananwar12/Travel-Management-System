const express = require("express")
const router = express.Router()
const Payment = require("../models/Payment")

// Debug route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Payment routes are working" })
})

// Get all payments for a user
router.get("/", async (req, res) => {
  try {
    const { username } = req.query

    if (!username) {
      return res.status(400).json({ error: "Username is required." })
    }

    console.log(`Fetching payments for user: ${username}`)
    const payments = await Payment.find({ username }).sort({ date: -1 })
    console.log(`Found ${payments.length} payments for ${username}`)
    res.json(payments)
  } catch (err) {
    console.error("Payment fetch error:", err)
    res.status(500).json({ error: "Failed to retrieve payments.", message: err.message })
  }
})

// Create a payment
router.post("/", async (req, res) => {
  try {
    console.log("Payment request received:", req.body)
    const { name, amount, date, status, username } = req.body

    if (!name || !amount || !username) {
      return res.status(400).json({ error: "Name, amount, and username are required." })
    }

    const newPayment = new Payment({
      name,
      amount: Number(amount),
      date: date || Date.now(),
      status: status || "Pending",
      username,
    })

    const savedPayment = await newPayment.save()
    console.log("Payment saved:", savedPayment)
    res.status(201).json(savedPayment)
  } catch (err) {
    console.error("Payment creation error:", err)
    res.status(500).json({ error: "Server error. Please try again later.", message: err.message })
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

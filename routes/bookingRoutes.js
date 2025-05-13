const express = require("express")
const router = express.Router()
const Booking = require("../models/Booking")
const Ticket = require("../models/Ticket")

// Get all bookings for a user
router.get("/user/:username", async (req, res) => {
  try {
    const bookings = await Booking.find({ username: req.params.username })
      .populate("ticketId")
      .sort({ bookingDate: -1 })
    res.json(bookings)
  } catch (err) {
    console.error("Error fetching bookings:", err)
    res.status(500).json({ error: "Failed to retrieve bookings." })
  }
})

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const { ticketId, username, passengerName, passengerEmail, passengerPhone } = req.body

    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." })
    }

    if (ticket.availableSeats < 1) {
      return res.status(400).json({ error: "No available seats for this flight." })
    }
    const newBooking = new Booking({
      username,
      ticketId,
      passengerName,
      passengerEmail,
      passengerPhone,
      price: ticket.price,
    })

    ticket.availableSeats -= 1
    await ticket.save()

    await newBooking.save()
    res.status(201).json(newBooking)
  } catch (err) {
    console.error("Error creating booking:", err)
    res.status(500).json({ error: "Failed to create booking.", message: err.message })
  }
})

// Cancel a booking
router.patch("/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." })
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled." })
    }

    booking.status = "Cancelled"
    await booking.save()

    const ticket = await Ticket.findById(booking.ticketId)
    if (ticket) {
      ticket.availableSeats += 1
      await ticket.save()
    }

    res.json(booking)
  } catch (err) {
    console.error("Error cancelling booking:", err)
    res.status(500).json({ error: "Failed to cancel booking." })
  }
})

module.exports = router

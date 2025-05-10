const express = require("express")
const router = express.Router()
const Ticket = require("../models/Ticket")

// Get all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ "departure.date": 1 })
    res.json(tickets)
  } catch (err) {
    console.error("Error fetching tickets:", err)
    res.status(500).json({ error: "Failed to retrieve tickets." })
  }
})

// Get a single ticket by ID
router.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." })
    }
    res.json(ticket)
  } catch (err) {
    console.error("Error fetching ticket:", err)
    res.status(500).json({ error: "Failed to retrieve ticket." })
  }
})

// Create a new ticket (for admin/postman use)
router.post("/", async (req, res) => {
  try {
    const newTicket = new Ticket(req.body)
    await newTicket.save()
    res.status(201).json(newTicket)
  } catch (err) {
    console.error("Error creating ticket:", err)
    res.status(500).json({ error: "Failed to create ticket.", message: err.message })
  }
})

// Update a ticket (for admin/postman use)
router.put("/:id", async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found." })
    }
    res.json(updatedTicket)
  } catch (err) {
    console.error("Error updating ticket:", err)
    res.status(500).json({ error: "Failed to update ticket." })
  }
})

// Delete a ticket (for admin/postman use)
router.delete("/:id", async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id)
    if (!deletedTicket) {
      return res.status(404).json({ error: "Ticket not found." })
    }
    res.json({ message: "Ticket deleted successfully." })
  } catch (err) {
    console.error("Error deleting ticket:", err)
    res.status(500).json({ error: "Failed to delete ticket." })
  }
})

module.exports = router

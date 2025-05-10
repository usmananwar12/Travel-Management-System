const mongoose = require("mongoose")

const ticketSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true,
  },
  flightNumber: {
    type: String,
    required: true,
  },
  departure: {
    city: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  arrival: {
    city: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  price: {
    type: Number,
    required: true,
  },
  class: {
    type: String,
    enum: ["Economy", "Business", "First"],
    default: "Economy",
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
  },
})

module.exports = mongoose.model("Ticket", ticketSchema)

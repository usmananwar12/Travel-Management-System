const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
    default: "Confirmed",
  },
  passengerName: {
    type: String,
    required: true,
  },
  passengerEmail: {
    type: String,
    required: true,
  },
  passengerPhone: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model("Booking", bookingSchema)

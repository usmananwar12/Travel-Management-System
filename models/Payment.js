const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  username: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model("Payment", paymentSchema)

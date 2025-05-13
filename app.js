const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const bodyParser = require("body-parser")

// Import routes
const userRoutes = require("./routes/userRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const ticketRoutes = require("./routes/ticketRoutes") 
const bookingRoutes = require("./routes/bookingRoutes")

const app = express()

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/travel_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// Serve static files (for frontend)
app.use(express.static(path.join(__dirname, "public")))

// API Routes
app.use("/api/users", userRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/bookings", bookingRoutes)

// Debug route
app.get("/api/debug", (req, res) => {
  res.json({ message: "API server is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({ error: "Internal server error", message: err.message })
})

// Handle 404 errors for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" })
})

// For all other routes, serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start the server
const PORT = process.env.PORT || 3500
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})

module.exports = app

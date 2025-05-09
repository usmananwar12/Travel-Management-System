const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

// Import routes
const userRoutes = require('./routes/userRoutes'); 

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/travel_management', {
useNewUrlParser: true,
useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/users', userRoutes); // For example: POST /api/users/register

// Start the server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log('Server started on port ${PORT}'));
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path as needed

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.json({ success: false, message: 'Incorrect username or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Signup Route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Username already taken." });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        res.status(201).json({ success: true, message: "User registered successfully." });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

module.exports = router;
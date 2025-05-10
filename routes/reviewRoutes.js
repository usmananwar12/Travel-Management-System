const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Create a review
router.post('/', async (req, res) => {
  try {
    console.log(req.body); // Debugging: Check what data is received
    const { name, rating, review } = req.body;

    if (!name || !rating || !review) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newReview = new Review({ name, rating, review });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});


// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve reviews." });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Create a review
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).send(review);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.send(reviews);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

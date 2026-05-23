const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Basic XSS sanitization
const sanitizeInput = (val) => {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '').trim();
};

// GET all approved reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new review
router.post('/', async (req, res) => {
  try {
    let { name, quote, stars, role } = req.body;

    name = sanitizeInput(name);
    quote = sanitizeInput(quote);
    role = sanitizeInput(role) || 'Client';

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Customer Name is required.' });
    }
    if (!quote) {
      return res.status(400).json({ message: 'Review content / Experience is required.' });
    }

    if (name.length > 50) {
      return res.status(400).json({ message: 'Name must be 50 characters or less.' });
    }
    if (quote.length > 500) {
      return res.status(400).json({ message: 'Review content must be 500 characters or less.' });
    }
    if (role.length > 30) {
      return res.status(400).json({ message: 'Role must be 30 characters or less.' });
    }

    const starVal = Number(stars) || 5;
    if (starVal < 1 || starVal > 5) {
      return res.status(400).json({ message: 'Stars must be a number between 1 and 5.' });
    }

    const newReview = new Review({
      name,
      quote,
      stars: starVal,
      role,
      approved: true
    });

    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

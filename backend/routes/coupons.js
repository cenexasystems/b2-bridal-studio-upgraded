const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// GET /api/coupons - Fetch all coupons (Admin)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coupons - Create coupon (Admin)
router.post('/', async (req, res) => {
  try {
    const { code, discountPercentage } = req.body;
    
    if (!code || !discountPercentage) {
      return res.status(400).json({ error: 'Code and discount percentage are required' });
    }
    
    if (discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({ error: 'Discount must be between 1 and 100' });
    }
    
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    
    const coupon = new Coupon({ code, discountPercentage });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coupons/validate - Validate a coupon (Customer)
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }
    
    res.json({ discountPercentage: coupon.discountPercentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/coupons/:id/toggle - Toggle active status (Admin)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/coupons/:id - Delete coupon (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

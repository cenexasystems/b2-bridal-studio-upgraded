const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Booking = require('../models/Booking');
const Bill = require('../models/Bill');
const Revenue = require('../models/Revenue');

// Multer config for payment proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
  }
});

// POST /api/bookings — Create a new booking
router.post('/', upload.single('paymentProof'), async (req, res) => {
  try {
    const { name, phone, upiId, transactionId, branch, items, total, dateTime, userId, email, couponCode, discountPercentage, discountAmount, finalAmount } = req.body;

    const booking = new Booking({
      userId: email || userId,
      name,
      phone,
      upiId,
      transactionId,
      branch,
      items: typeof items === 'string' ? JSON.parse(items) : items,
      total: Number(total),
      couponCode: couponCode || null,
      discountPercentage: discountPercentage ? Number(discountPercentage) : null,
      discountAmount: discountAmount ? Number(discountAmount) : null,
      finalAmount: finalAmount ? Number(finalAmount) : Number(total),
      dateTime,
      paymentProof: req.file ? req.file.filename : null,
      status: 'Pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/bookings — Admin: Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/user/:email — Customer: Get own bookings
router.get('/user/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.email }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/accept — Admin: Accept booking
router.patch('/:id/accept', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'Approved';
    await booking.save();

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/reject — Admin: Reject booking
router.patch('/:id/reject', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'Rejected';
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/slot-check — Check slot availability (Approved bookings only)
router.get('/slot-check', async (req, res) => {
  try {
    const { branch, date, hour } = req.query;
    if (!branch || !date || !hour) {
      return res.status(400).json({ error: 'branch, date, and hour are required' });
    }
    // dateTime is stored as ISO string like "2026-05-14T10:00:00.000Z" or "2026-05-14T10:00:00"
    // We match by branch, Approved status, and dateTime starting with the date+hour
    const paddedHour = String(hour).padStart(2, '0');
    const prefix = `${date}T${paddedHour}`;
    const count = await Booking.countDocuments({
      branch,
      status: 'Approved',
      dateTime: { $regex: `^${prefix}` }
    });
    res.json({ count, available: count < 3 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/bill/:id — Get bill by ID
router.get('/bill/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

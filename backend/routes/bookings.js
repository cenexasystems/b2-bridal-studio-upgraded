const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Booking = require('../models/Booking');
const Bill = require('../models/Bill');
const Revenue = require('../models/Revenue');
const SlotBlock = require('../models/SlotBlock');

// Ensure uploads directory exists (required for Render and fresh environments)
fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });

// Multer config for payment proof uploads (in-memory storage to survive ephemeral redeploys)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    // Accept if extension matches OR if it is a pdf/image mime
    const mime = /image\/|application\/pdf/.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
  }
});

// POST /api/bookings — Create a new booking
router.post('/', upload.single('paymentProof'), async (req, res) => {
  try {
    const {
      name, phone, upiId, transactionId, branch, items,
      total, dateTime, userId, email,
      couponCode, discountPercentage, discountAmount, finalAmount,
      gstAmount
    } = req.body;

    if (!name || !phone || !upiId || !transactionId || !branch || !total) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Check slot capacity & slot blocking
    if (dateTime && branch) {
      const datePart = dateTime.split('T')[0];
      const timePart = dateTime.split('T')[1] || '';
      const hourPart = timePart.split(':')[0] || '00';
      const paddedHour = String(hourPart).padStart(2, '0');
      const prefix = `${datePart}T${paddedHour}`;

      // Check slot blocking first
      const blocks = await SlotBlock.find({
        date: datePart,
        branch: { $in: ['All', branch] }
      });

      for (const block of blocks) {
        if (block.type === 'Full Day') {
          return res.status(400).json({ error: 'This date is currently blocked for bookings by admin.' });
        } else if (block.type === 'Time Range') {
          const hourVal = parseInt(paddedHour, 10);
          const startVal = parseInt(block.startTime, 10);
          const endVal = parseInt(block.endTime, 10);
          if (hourVal >= startVal && hourVal < endVal) {
            return res.status(400).json({ error: 'This slot is currently blocked for bookings by admin.' });
          }
        }
      }

      // Check slot capacity (Max 3 Approved/Completed bookings)
      const count = await Booking.countDocuments({
        branch,
        status: { $in: ['Approved', 'Completed'] },
        dateTime: { $regex: `^${prefix}` }
      });

      if (count >= 3) {
        return res.status(400).json({ error: 'This slot is already booked. Please choose another time slot.' });
      }
    }

    const userEmail = (email || userId || '').trim().toLowerCase();

    const booking = new Booking({
      userId: userEmail,
      name,
      phone,
      upiId,
      transactionId,
      branch,
      items: typeof items === 'string' ? JSON.parse(items) : (items || []),
      total: Number(total),
      gstAmount: Number(gstAmount) || 0,
      couponCode: couponCode || null,
      discountPercentage: discountPercentage ? Number(discountPercentage) : null,
      discountAmount: discountAmount ? Number(discountAmount) : null,
      finalAmount: finalAmount ? Number(finalAmount) : Number(total),
      dateTime: dateTime || new Date().toISOString(),
      paymentProof: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null,
      status: 'Pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error('[Booking POST error]', err.message);
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

// ─── NAMED ROUTES (must be before /:id wildcards) ────────────────────────────

// GET /api/bookings/slot-check — Check slot availability (Approved/Completed bookings & admin slot blocks)
router.get('/slot-check', async (req, res) => {
  try {
    const { branch, date, hour } = req.query;
    if (!branch || !date || !hour) {
      return res.status(400).json({ error: 'branch, date, and hour are required' });
    }

    // Check slot blocking
    const blocks = await SlotBlock.find({
      date,
      branch: { $in: ['All', branch] }
    });

    for (const block of blocks) {
      if (block.type === 'Full Day') {
        return res.json({ available: false, count: 0, reason: 'blocked' });
      } else if (block.type === 'Time Range') {
        const hourVal = parseInt(hour, 10);
        const startVal = parseInt(block.startTime, 10);
        const endVal = parseInt(block.endTime, 10);
        if (hourVal >= startVal && hourVal < endVal) {
          return res.json({ available: false, count: 0, reason: 'blocked' });
        }
      }
    }

    const paddedHour = String(hour).padStart(2, '0');
    const prefix = `${date}T${paddedHour}`;
    const count = await Booking.countDocuments({
      branch,
      status: { $in: ['Approved', 'Completed'] },
      dateTime: { $regex: `^${prefix}` }
    });
    res.json({ count, available: count < 3 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/full-slots — Get all slots for a branch and date that are full (>= 3 bookings) or blocked
router.get('/full-slots', async (req, res) => {
  try {
    const { branch, date } = req.query;
    if (!branch || !date) {
      return res.status(400).json({ error: 'branch and date are required' });
    }
    
    // Check slot blocks for this date and branch
    const blocks = await SlotBlock.find({
      date,
      branch: { $in: ['All', branch] }
    });

    let isDayBlocked = false;
    const blockedSlotsSet = new Set();

    blocks.forEach(block => {
      if (block.type === 'Full Day') {
        isDayBlocked = true;
      } else if (block.type === 'Time Range') {
        const start = parseInt(block.startTime, 10);
        const end = parseInt(block.endTime, 10);
        for (let h = start; h < end; h++) {
          blockedSlotsSet.add(h.toString());
        }
      }
    });

    // Find all approved or completed bookings for this branch and date
    const prefix = date;
    const bookings = await Booking.find({
      branch,
      status: { $in: ['Approved', 'Completed'] },
      dateTime: { $regex: `^${prefix}` }
    });

    // Group by hour and count
    const slotCounts = {};
    bookings.forEach(b => {
      const parts = b.dateTime.split('T');
      if (parts[1]) {
        const hour = parts[1].split(':')[0];
        const numHour = parseInt(hour, 10).toString(); // e.g. "13" or "10"
        slotCounts[numHour] = (slotCounts[numHour] || 0) + 1;
      }
    });

    // Find slots where count >= 3
    const fullSlots = Object.keys(slotCounts).filter(hour => slotCounts[hour] >= 3);

    res.json({
      fullSlots,
      blockedSlots: Array.from(blockedSlotsSet),
      isDayBlocked
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/user/:email — Customer: Get own bookings (case-insensitive)
router.get('/user/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).trim();
    // Escape regex special chars then do case-insensitive match
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const bookings = await Booking.find({
      userId: { $regex: new RegExp(`^${escaped}$`, 'i') }
    }).sort({ createdAt: -1 });
    res.json(bookings);
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

// ─── /:id WILDCARD ROUTES ─────────────────────────────────────────────────────

// PATCH /api/bookings/:id/accept — Admin: Accept booking → Approved
router.patch('/:id/accept', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/reject — Admin: Reject booking
router.patch('/:id/reject', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status — Admin: Set any valid status directly
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

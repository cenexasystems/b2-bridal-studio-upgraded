const express = require('express');
const router = express.Router();
const CashAppointment = require('../models/CashAppointment');
const Booking = require('../models/Booking');
const SlotBlock = require('../models/SlotBlock');
const { verifyToken } = require('../middleware/auth');

// ─── POST /api/cash-appointments — Customer: Create a cash walk-in appointment ─
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, phone, branch, items, total, dateTime, userId, email } = req.body;

    if (!name || !phone || !branch || !total) {
      return res.status(400).json({ error: 'Missing required fields: name, phone, branch, and total are required.' });
    }

    // ─── Slot availability + blocking check (same 3-per-slot rule as online bookings)
    if (dateTime && branch) {
      const datePart = dateTime.split('T')[0];
      const timePart = dateTime.split('T')[1] || '';
      const hourPart = timePart.split(':')[0] || '00';
      const paddedHour = String(hourPart).padStart(2, '0');
      const prefix = `${datePart}T${paddedHour}`;

      // Check slot blocking
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

      // Count online Approved/Completed bookings for the slot
      const onlineCount = await Booking.countDocuments({
        branch,
        status: { $in: ['Approved', 'Completed'] },
        dateTime: { $regex: `^${prefix}` }
      });

      // Count cash Pending/Completed appointments for the slot
      const cashCount = await CashAppointment.countDocuments({
        branch,
        status: { $in: ['Pending', 'Completed'] },
        dateTime: { $regex: `^${prefix}` }
      });

      if (onlineCount + cashCount >= 3) {
        return res.status(400).json({ error: 'This slot is fully booked. Please choose another time slot.' });
      }
    }

    const userEmail = (req.user?.email || email || userId || '').trim().toLowerCase();

    const appointment = new CashAppointment({
      userId: userEmail,
      name,
      phone,
      branch,
      items: typeof items === 'string' ? JSON.parse(items) : (items || []),
      total: Number(total),
      dateTime: dateTime || new Date().toISOString(),
      status: 'Pending'
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error('[CashAppointment POST error]', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ─── GET /api/cash-appointments — Admin: Get all cash appointments ─────────────
router.get('/', async (req, res) => {
  try {
    const appointments = await CashAppointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/cash-appointments/user/:email — Customer: Get own appointments ───
router.get('/user/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).trim();
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const appointments = await CashAppointment.find({
      userId: { $regex: new RegExp(`^${escaped}$`, 'i') }
    }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/cash-appointments/:id/status — Admin: Mark Completed ──────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const appointment = await CashAppointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

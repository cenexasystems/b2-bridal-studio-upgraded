const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');

const Booking         = require('../models/Booking');
const CashAppointment = require('../models/CashAppointment');
const Bill            = require('../models/Bill');
const Coupon          = require('../models/Coupon');
const Customer        = require('../models/Customer');
const Expense         = require('../models/Expense');
const Revenue         = require('../models/Revenue');
const Attendance      = require('../models/Attendance');
const StaffWork       = require('../models/StaffWork');
const SlotBlock       = require('../models/SlotBlock');
const Review          = require('../models/Review');
const Stock           = require('../models/Stock');

/**
 * POST /api/admin/cleanup-testdata
 * Deletes all transactional/test data.
 * KEEPS: Blogs, Services, Courses, Products, Staff, Users (admin logins)
 * Protected: staff or owner token required.
 */
router.post('/cleanup-testdata', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const collections = [
      { name: 'Bookings',           model: Booking },
      { name: 'CashAppointments',   model: CashAppointment },
      { name: 'Bills',              model: Bill },
      { name: 'Coupons',            model: Coupon },
      { name: 'Customers',          model: Customer },
      { name: 'Expenses',           model: Expense },
      { name: 'Revenue',            model: Revenue },
      { name: 'Attendance',         model: Attendance },
      { name: 'StaffWork',          model: StaffWork },
      { name: 'SlotBlocks',         model: SlotBlock },
      { name: 'Reviews',            model: Review },
      { name: 'Stock',              model: Stock },
    ];

    const summary = [];
    for (const col of collections) {
      const result = await col.model.deleteMany({});
      summary.push({ collection: col.name, deleted: result.deletedCount });
    }

    res.json({
      success: true,
      message: 'Test data cleaned successfully. Blogs, Services, Courses, Products, Staff and Admin Users are intact.',
      summary
    });
  } catch (err) {
    console.error('[Cleanup] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

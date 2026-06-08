/**
 * B2 Bridal Studio — Test Data Cleanup Script
 * Run: node cleanup_testdata.js
 *
 * DELETES:  Bookings, CashAppointments, Bills, Coupons, Customers,
 *           Expenses, Revenue, Attendance, StaffWork, SlotBlocks,
 *           Reviews, Stock
 *
 * KEEPS:    Blogs, Services, Courses, Products, Staff, Users (admin logins)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in environment. Please set it and retry.');
  process.exit(1);
}

// ── Models ──────────────────────────────────────────────────────────────────
const Booking        = require('./models/Booking');
const CashAppointment = require('./models/CashAppointment');
const Bill           = require('./models/Bill');
const Coupon         = require('./models/Coupon');
const Customer       = require('./models/Customer');
const Expense        = require('./models/Expense');
const Revenue        = require('./models/Revenue');
const Attendance     = require('./models/Attendance');
const StaffWork      = require('./models/StaffWork');
const SlotBlock      = require('./models/SlotBlock');
const Review         = require('./models/Review');
const Stock          = require('./models/Stock');

async function cleanTestData() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB\n');

  const results = [];

  const collections = [
    { name: 'Bookings',           model: Booking },
    { name: 'Cash Appointments',  model: CashAppointment },
    { name: 'Bills',              model: Bill },
    { name: 'Coupons',            model: Coupon },
    { name: 'Customers',          model: Customer },
    { name: 'Expenses',           model: Expense },
    { name: 'Revenue',            model: Revenue },
    { name: 'Attendance',         model: Attendance },
    { name: 'Staff Work Logs',    model: StaffWork },
    { name: 'Slot Blocks',        model: SlotBlock },
    { name: 'Reviews',            model: Review },
    { name: 'Stock',              model: Stock },
  ];

  for (const col of collections) {
    try {
      const count = await col.model.countDocuments();
      const result = await col.model.deleteMany({});
      results.push({ name: col.name, deleted: result.deletedCount, total: count });
      console.log(`🗑️   ${col.name.padEnd(22)} → deleted ${result.deletedCount} / ${count} records`);
    } catch (err) {
      console.error(`⚠️   ${col.name}: ${err.message}`);
    }
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('✅  KEPT (untouched):');
  console.log('    • Blogs');
  console.log('    • Services');
  console.log('    • Courses');
  console.log('    • Products');
  console.log('    • Staff members');
  console.log('    • Admin Users (login accounts)');
  console.log('──────────────────────────────────────────────');
  console.log('\n🎉  Cleanup complete! Database is ready for client handover.\n');

  await mongoose.disconnect();
}

cleanTestData().catch(err => {
  console.error('❌  Cleanup failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});

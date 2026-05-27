const express = require('express');
const Bill = require('../models/Bill');
const Revenue = require('../models/Revenue');
const { verifyToken, verifyRole } = require('../middleware/auth');

const router = express.Router();

// ─── GET single bill by ID (Public — for BillView page) ────────────────────
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET all bills (Admin / Owner) ─────────────────────────────────────────
router.get('/', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /generate-from-booking/:id — Generate bill from an approved booking ────────
router.post('/generate-from-booking/:id', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'Approved') return res.status(400).json({ error: 'Booking must be Approved to generate bill' });
    if (booking.billId) return res.status(400).json({ error: 'Bill already generated for this booking' });

    // Calculate dynamic subtotal and GST
    let calculatedSubtotal = 0;
    let calculatedGst = 0;
    
    (booking.items || []).forEach(item => {
      const qty = item.quantity || 1;
      const finalPrice = item.price * qty;
      const gstPercent = item.gstPercentage || 0;
      if (gstPercent > 0) {
        const base = finalPrice / (1 + gstPercent / 100);
        calculatedSubtotal += base;
        calculatedGst += (finalPrice - base);
      } else {
        calculatedSubtotal += finalPrice;
      }
    });

    const billTotal = booking.finalAmount || booking.total; // actual amount paid after coupon discounts
    const hasDiscount = booking.couponCode && booking.discountAmount > 0;

    // Scale subtotal and GST proportionally under coupon discount
    let billSubtotal = calculatedSubtotal;
    let billGst = calculatedGst;
    
    if (hasDiscount && booking.total > 0) {
      const discountRatio = billTotal / booking.total;
      billSubtotal = calculatedSubtotal * discountRatio;
      billGst = calculatedGst * discountRatio;
    }

    billSubtotal = Math.round(billSubtotal * 100) / 100;
    billGst = Math.round(billGst * 100) / 100;

    // Create a bill entry
    const bill = new Bill({
      type: 'service',
      items: booking.items,
      subtotal: billSubtotal,
      gst: billGst,
      total: billTotal,
      // Coupon / discount info
      couponCode: booking.couponCode || undefined,
      discountPercentage: booking.discountPercentage || undefined,
      discountAmount: booking.discountAmount || undefined,
      originalTotal: hasDiscount ? booking.total : undefined,
      bookingId: booking._id,
      userId: booking.userId,
      branch: booking.branch,
      paymentMethod: paymentMethod || 'upi',
      source: 'online',
      customerDetails: {
        name: booking.name,
        phone: booking.phone,
        date: booking.dateTime
      }
    });
    await bill.save();
    console.log("Bill created:", bill);

    let revenueCreated = true;
    try {
      const newRevenue = await Revenue.create({
        date: new Date(),
        customer: booking.name || 'Customer',
        total: billTotal,
        source: 'online',
        paymentMethod: paymentMethod || 'upi',
        billId: bill._id,
        branch: booking.branch || ''
      });
      console.log("Revenue created:", newRevenue._id);
    } catch (revErr) {
      console.error("Revenue update failed:", revErr);
      revenueCreated = false;
    }

    booking.billId = bill._id;
    booking.status = 'Completed';
    await booking.save();

    res.status(201).json({ success: true, billCreated: true, revenueCreated, bill, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /offline — Create offline bill + Revenue (Admin/Staff) ─────────────
router.post('/offline', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const { items, total, source, paymentMethod, customer, subtotal: reqSubtotal, gst: reqGst } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Total must be greater than 0' });
    }

    let calculatedSubtotal = 0;
    let calculatedGst = 0;
    
    (items || []).forEach(item => {
      const qty = item.quantity || 1;
      const finalPrice = item.price * qty;
      const gstPercent = item.gstPercentage || 0;
      if (item.itemType === 'service' && gstPercent > 0) {
        const base = finalPrice / (1 + gstPercent / 100);
        calculatedSubtotal += base;
        calculatedGst += (finalPrice - base);
      } else {
        calculatedSubtotal += finalPrice;
      }
    });

    const billSubtotal = Math.round(calculatedSubtotal * 100) / 100;
    const billGst = Math.round(calculatedGst * 100) / 100;

    // Create the bill
    const bill = new Bill({
      type: 'mixed',
      items,
      subtotal: billSubtotal,
      gst: billGst,
      total,
      source: source || 'offline',
      paymentMethod: paymentMethod || 'cash',
      customer: customer || 'Walk-in',
      customerDetails: { name: customer || 'Walk-in' }
    });
    await bill.save();
    console.log("Bill created:", bill._id);

    let revenueCreated = true;
    try {
      const newRevenue = await Revenue.create({
        date: bill.date,
        customer: customer || 'Walk-in',
        total,
        source: source || 'offline',
        paymentMethod: paymentMethod || 'cash',
        billId: bill._id,
        branch: ''
      });
      console.log("Revenue created:", newRevenue._id);
    } catch (revErr) {
      console.error("Revenue update failed:", revErr);
      revenueCreated = false;
    }

    res.status(201).json({ success: true, billCreated: true, revenueCreated, bill });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

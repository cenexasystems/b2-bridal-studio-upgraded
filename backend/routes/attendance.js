const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');


// ➕ MARK ATTENDANCE
router.post('/', async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE ATTENDANCE EXIT TIME
router.put('/:id', async (req, res) => {
  try {
    const { exitTime } = req.body;
    // We only update exitTime to preserve other fields
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { exitTime },
      { new: true }
    );
    res.json(updatedAttendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📥 GET ALL ATTENDANCE
router.get('/', async (req, res) => {
  try {
    const data = await Attendance.find().populate('staffId');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ❌ DELETE OLD RECORDS (2 months)
router.delete('/cleanup', async (req, res) => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    await Attendance.deleteMany({ date: { $lt: twoMonthsAgo } });

    res.json({ message: 'Old records deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');


// ➕ MARK ATTENDANCE
router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body };

    if (['Leave', 'Absent', 'Permission'].includes(payload.status)) {
      delete payload.entryTime;
      delete payload.exitTime;
      payload.exitLocked = false;
    } else {
      payload.status = 'Present';
      delete payload.leaveReason;
      if (payload.exitTime) {
        payload.exitLocked = true;
      } else {
        payload.exitLocked = false;
      }
    }
    const attendance = new Attendance(payload);
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
    
    // Find attendance record to check lock status
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    if (attendance.exitLocked) {
      return res.status(400).json({ error: 'Exit time is locked and cannot be updated' });
    }

    attendance.exitTime = exitTime;
    attendance.exitLocked = true;
    
    const updatedAttendance = await attendance.save();
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
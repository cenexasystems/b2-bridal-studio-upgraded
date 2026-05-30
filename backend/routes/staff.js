const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');


// ➕ ADD STAFF
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, age, experienceYears } = req.body;
    if (!name || !phone || !email || !age || experienceYears === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (isNaN(experienceYears) || Number(experienceYears) < 0) {
      return res.status(400).json({ error: 'Experience Years must be a valid non-negative number' });
    }

    const lastStaff = await Staff.findOne({ staffId: { $ne: null } }).sort({ _id: -1 });
    let nextIdNumber = 1;
    if (lastStaff && lastStaff.staffId) {
      const match = lastStaff.staffId.match(/\d+/);
      if (match) {
        nextIdNumber = parseInt(match[0], 10) + 1;
      }
    }
    const staffId = `STF${String(nextIdNumber).padStart(3, '0')}`;

    const staff = new Staff({ 
      name, 
      phone, 
      email, 
      age: Number(age), 
      experienceYears: Number(experienceYears), 
      staffId 
    });
    await staff.save();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✏️ EDIT STAFF
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, age, experienceYears } = req.body;
    if (!name || !phone || !email || !age || experienceYears === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (isNaN(experienceYears) || Number(experienceYears) < 0) {
      return res.status(400).json({ error: 'Experience Years must be a valid non-negative number' });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id, 
      { name, phone, email, age: Number(age), experienceYears: Number(experienceYears) }, 
      { new: true, runValidators: true }
    );
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📥 GET ALL STAFF
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ❌ DELETE STAFF
router.delete('/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
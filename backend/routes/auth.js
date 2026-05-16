const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper to seed initial users for testing (Remove in production or secure it)
router.post('/seed', async (req, res) => {
  try {
    const ownerExists = await User.findOne({ role: 'owner' });
    if (!ownerExists) {
      const hashedOwner = await bcrypt.hash('owner123', 10);
      await User.create({ username: 'owner', password: hashedOwner, role: 'owner' });
    }

    const staffExists = await User.findOne({ role: 'staff' });
    if (!staffExists) {
      const hashedStaff = await bcrypt.hash('staff123', 10);
      await User.create({ username: 'staff', password: hashedStaff, role: 'staff' });
    }

    res.json({ message: 'Users seeded (owner/owner123, staff/staff123)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[Auth] Attempting login for username: ${username}`);

    // Find user strictly by username, irrespective of role
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`[Auth] Login failed: User not found for username: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'owner') {
      console.log(`[Auth] Login blocked: Direct owner login is disabled`);
      return res.status(403).json({ message: 'Direct owner login is disabled. Please log in as staff.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Auth] Login failed: Password mismatch for username: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[Auth] Login successful for username: ${username}`);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error(`[Auth] Server error during login:`, error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-owner-password', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Find the owner user
    const owner = await User.findOne({ role: 'owner' });
    if (!owner) {
      return res.status(404).json({ message: 'Owner account not found' });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate a temporary access token with owner privileges specifically for revenue viewing
    const token = jwt.sign(
      { id: owner._id, role: 'owner', tempAccess: true },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.json({ success: true, revenueToken: token });
  } catch (error) {
    console.error(`[Auth] Server error during owner password verification:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

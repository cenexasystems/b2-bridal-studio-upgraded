const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ VERY IMPORTANT (serve uploaded images)
app.use('/uploads', express.static('uploads'));


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // Auto-seed default users
    try {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');

      const ownerExists = await User.findOne({ role: 'owner' });
      if (!ownerExists) {
        const hashedOwner = await bcrypt.hash('owner123', 10);
        await User.create({ username: 'owner', password: hashedOwner, role: 'owner' });
        console.log('[Seed] Created default owner (owner / owner123)');
      }

      const staffExists = await User.findOne({ role: 'staff' });
      if (!staffExists) {
        const hashedStaff = await bcrypt.hash('staff123', 10);
        await User.create({ username: 'staff', password: hashedStaff, role: 'staff' });
        console.log('[Seed] Created default staff (staff / staff123)');
      }
    } catch (seedErr) {
      console.error('[Seed] Error seeding default users:', seedErr.message);
    }

    // Auto-seed Hair Extension services
    try {
      const Service = require('./models/Service');
      const existing = await Service.findOne({ category: 'Hair Extension' });
      if (!existing) {
        const hairExtensions = [
          'Weft Extension', 'Micro Beads', 'Nano Beads', '8D Extension',
          '6D Extension', 'Tape Extension', 'Invisible Tape Extension',
          'Tape & Invisible Extension', 'K-Tip Extension', 'Seamless Extension',
          'Clip Extension', "Men's Patch"
        ];
        await Service.insertMany(
          hairExtensions.map(name => ({ category: 'Hair Extension', name, price: 10000 }))
        );
        console.log('[Seed] Hair Extension services seeded successfully.');
      }
    } catch (seedErr) {
      console.error('[Seed] Error seeding Hair Extension services:', seedErr.message);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customer', require('./routes/customerAuth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/services', require('./routes/services'));
app.use('/api/products', require('./routes/products'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/revenue', require('./routes/revenue'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/cash-appointments', require('./routes/cashAppointments'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/slot-blocks', require('./routes/slotBlocks'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/staff-work', require('./routes/staffWork'));
app.use('/api/expenses', require('./routes/expenses'));



app.use('/api/admin', require('./routes/adminCleanup'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
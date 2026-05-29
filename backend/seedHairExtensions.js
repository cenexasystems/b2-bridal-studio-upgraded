const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB to seed Hair Extensions');
    const existing = await Service.findOne({ category: 'Hair Extension' });
    if (existing) {
      console.log('Hair Extension category already exists. Skipping seed.');
      process.exit(0);
    }

    const extensions = [
      "Weft Extension",
      "Micro Beads",
      "Nano Beads",
      "8D Extension",
      "6D Extension",
      "Tape Extension",
      "Invisible Tape Extension",
      "Tape & Invisible Extension",
      "K-Tip Extension",
      "Seamless Extension",
      "Clip Extension",
      "Men's Patch"
    ];

    const records = extensions.map(name => ({
      category: 'Hair Extension',
      name,
      price: 10000,
      gstPercentage: 18
    }));

    await Service.insertMany(records);
    console.log('Seeded Hair Extension services successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding:', err);
    process.exit(1);
  });

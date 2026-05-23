const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quote: { type: String, required: true, trim: true },
  stars: { type: Number, default: 5, min: 1, max: 5 },
  role: { type: String, default: 'Client', trim: true },
  approved: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

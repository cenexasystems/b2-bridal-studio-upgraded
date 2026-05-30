const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  upiId: { type: String },
  transactionId: { type: String },
  branch: { type: String, enum: ['Chennai', 'Madurai'], required: true },
  items: [{
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    gstPercentage: { type: Number }
  }],
  total: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },
  couponCode: { type: String },
  discountPercentage: { type: Number },
  discountAmount: { type: Number },
  finalAmount: { type: Number },
  dateTime: { type: String },
  paymentProof: { type: String }, // file path
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Pending' },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

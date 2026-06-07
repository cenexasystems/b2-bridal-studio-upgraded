const mongoose = require('mongoose');

const cashAppointmentSchema = new mongoose.Schema({
  userId: { type: String }, // customer email
  name: { type: String, required: true },
  phone: { type: String, required: true },
  branch: { type: String, enum: ['Chennai', 'Madurai'], required: true },
  items: [{
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    peopleCount: { type: Number, default: 1 },
    gstPercentage: { type: Number }
  }],
  total: { type: Number, required: true },
  dateTime: { type: String }, // ISO format
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  notes: { type: String } // admin notes
}, { timestamps: true });

module.exports = mongoose.model('CashAppointment', cashAppointmentSchema);

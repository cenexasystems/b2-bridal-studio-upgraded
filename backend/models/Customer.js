const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  dob: { type: Date },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google', 'email-otp'], default: 'local' },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastLoginDate: { type: Date },
  accountStatus: { type: String, enum: ['Active', 'Suspended'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
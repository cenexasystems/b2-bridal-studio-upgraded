const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  date: Date,
  entryTime: String,
  exitTime: String,
  status: {
    type: String,
    enum: ['Present', 'Leave', 'Absent', 'Permission'],
    default: 'Present'
  },
  leaveReason: String,
  exitLocked: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);

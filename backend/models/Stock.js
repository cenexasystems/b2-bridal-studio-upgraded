const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  productName: { type: String, required: true },

  purchaseDate: { type: Date, required: true },

  totalQuantity: { type: Number, required: true },

  remainingQuantity: { type: Number, required: true },

  usageHistory: [
    {
      usedQuantity: { type: Number, required: true },
      usedByStaffId: { type: String, required: true },
      staffName: { type: String, required: true },
      serviceLinked: { type: String },
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Stock', stockSchema);
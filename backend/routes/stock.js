const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');


// ➕ ADD PRODUCT
router.post('/', async (req, res) => {
  try {
    const { productName, purchaseDate, totalQuantity } = req.body;

    const newStock = new Stock({
      productName,
      purchaseDate,
      totalQuantity,
      remainingQuantity: totalQuantity,
      usageHistory: [] // ✅ initialize history
    });

    await newStock.save();
    res.json(newStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📥 GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ purchaseDate: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ➖ USE PRODUCT (IMPORTANT 🔥)
router.post('/:id/use', async (req, res) => {
  try {
    const { usedQuantity, usedByStaffId, staffName, serviceLinked } = req.body;

    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (usedQuantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    if (!usedByStaffId || !staffName) {
      return res.status(400).json({ message: 'Staff selection is required for stock consumption' });
    }

    if (usedQuantity > stock.remainingQuantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // ✅ update remaining
    stock.remainingQuantity -= usedQuantity;

    // ✅ save usage history WITH DATE AND STAFF INFO
    stock.usageHistory.push({
      usedQuantity: Number(usedQuantity),
      usedByStaffId,
      staffName,
      serviceLinked: serviceLinked || '',
      date: new Date()
    });

    await stock.save();

    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ❌ DELETE PRODUCT
router.delete('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { verifyToken, verifyRole } = require('../middleware/auth');

// 📥 GET all expenses (Admin/Staff/Owner)
router.get('/', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ expenseDate: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ ADD new expense (Admin/Staff/Owner)
router.post('/', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const { staffId, staffName, expenseDate, description, amount } = req.body;
    if (!staffId || !staffName || !expenseDate || !description || amount === undefined || amount === null) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const expense = new Expense({
      staffId,
      staffName,
      expenseDate: new Date(expenseDate),
      description,
      amount: Number(amount)
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ DELETE expense (Admin/Staff/Owner)
router.delete('/:id', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

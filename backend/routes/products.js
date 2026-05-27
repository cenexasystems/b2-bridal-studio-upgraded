const express = require('express');
const Product = require('../models/Product');
const { verifyToken, verifyRole } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');

const router = express.Router();


// 🔥 MULTER CONFIG (for file upload, in-memory storage to survive ephemeral redeploys)
const storage = multer.memoryStorage();
const upload = multer({ storage });


// 🔹 GET ALL PRODUCTS (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 ADD PRODUCT (Admin/Owner) — WITH IMAGE UPLOAD
router.post(
  '/',
  verifyToken,
  verifyRole(['staff', 'owner']),
  upload.single('image'),
  async (req, res) => {
    try {
      const newProduct = new Product({
        name: req.body.name,
        category: req.body.category,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        image: req.file
          ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
          : ''
      });

      await newProduct.save();
      res.status(201).json(newProduct);

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);


// 🔹 UPDATE PRODUCT (Admin/Owner) — WITH IMAGE UPDATE
router.put(
  '/:id',
  verifyToken,
  verifyRole(['staff', 'owner']),
  upload.single('image'),
  async (req, res) => {
    try {
      const updateData = {
        name: req.body.name,
        category: req.body.category,
        price: Number(req.body.price),
        stock: Number(req.body.stock)
      };

      // if new image uploaded
      if (req.file) {
        updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(updatedProduct);

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);


// 🔹 DELETE PRODUCT
router.delete('/:id', verifyToken, verifyRole(['staff', 'owner']), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
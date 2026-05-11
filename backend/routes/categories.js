const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Manage transaction categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories for the current user
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Groceries
 *               type:
 *                 type: string
 *                 enum: [Income, Expense]
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */

router.use(auth);

const normalizeName = (value) => (typeof value === 'string' ? value.trim() : '');

const findDuplicateCategory = async (userId, name, excludeId) => {
  const query = {
    userId,
    name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Category.findOne(query);
};

// Get all categories for user
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a category
router.post('/', async (req, res) => {
  try {
    const name = normalizeName(req.body.name);
    const { type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const duplicateCategory = await findDuplicateCategory(req.user.userId, name);
    if (duplicateCategory) {
      return res.status(409).json({ message: 'A category with this name already exists' });
    }

    const category = new Category({ userId: req.user.userId, name, type });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const name = normalizeName(req.body.name);
    const { type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const duplicateCategory = await findDuplicateCategory(req.user.userId, name, req.params.id);
    if (duplicateCategory) {
      return res.status(409).json({ message: 'A category with this name already exists' });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, type },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Set and track monthly spending budgets
 */

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Get all budgets with spending progress for current month
 *     tags: [Budgets]
 *     responses:
 *       200:
 *         description: List of budgets with spentAmount and progress
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Budget'
 *
 *   post:
 *     summary: Create or update a budget for a category
 *     tags: [Budgets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, amount]
 *             properties:
 *               categoryId:
 *                 type: string
 *                 example: 6a013e1906035227ee1b3f10
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 10000
 *     responses:
 *       201:
 *         description: Budget created or updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 *
 * /budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget deleted
 */

router.use(auth);

// Get all budgets with progress
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.userId }).populate('categoryId');
    
    // Calculate progress for each budget (spending in current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const results = await Promise.all(budgets.map(async (budget) => {
      const spending = await Transaction.aggregate([
        {
          $match: {
            userId: budget.userId,
            categoryId: budget.categoryId._id,
            type: 'Expense',
            date: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const spentAmount = spending.length > 0 ? spending[0].total : 0;
      return {
        ...budget.toObject(),
        spentAmount,
        progress: (spentAmount / budget.amount) * 100
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or Update budget
router.post('/', async (req, res) => {
  try {
    const { categoryId, amount, period } = req.body;
    let budget = await Budget.findOne({ userId: req.user.userId, categoryId });
    
    if (budget) {
      budget.amount = amount;
      budget.period = period || 'Monthly';
      await budget.save();
    } else {
      budget = new Budget({ userId: req.user.userId, categoryId, amount, period: period || 'Monthly' });
      await budget.save();
    }
    
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

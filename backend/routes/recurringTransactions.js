const express = require('express');
const router = express.Router();
const RecurringTransaction = require('../models/RecurringTransaction');
const auth = require('../middleware/auth');
const { getFirstRunDate, normalizeDate } = require('../utils/recurringUtils');

router.use(auth);

// Get recurring transaction rules
router.get('/', async (req, res) => {
  try {
    const rules = await RecurringTransaction.find({ userId: req.user.userId })
      .populate('categoryId', 'name type')
      .sort({ createdAt: -1 });

    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create recurring transaction rule
router.post('/', async (req, res) => {
  try {
    const { title, amount, categoryId, type, note, frequency, startDate } = req.body;

    if (!title || !amount || !categoryId || !type || !frequency || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalizedStartDate = normalizeDate(startDate);
    const nextRunDate = getFirstRunDate(normalizedStartDate, frequency);

    const rule = new RecurringTransaction({
      userId: req.user.userId,
      title: title.trim(),
      amount,
      categoryId,
      type,
      note,
      frequency,
      startDate: normalizedStartDate,
      nextRunDate,
    });

    await rule.save();
    await rule.populate('categoryId', 'name type');

    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update recurring transaction rule
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, categoryId, type, note, frequency, startDate, isActive } = req.body;

    const rule = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!rule) {
      return res.status(404).json({ message: 'Recurring rule not found' });
    }

    if (title !== undefined) rule.title = title.trim();
    if (amount !== undefined) rule.amount = amount;
    if (categoryId !== undefined) rule.categoryId = categoryId;
    if (type !== undefined) rule.type = type;
    if (note !== undefined) rule.note = note;
    if (isActive !== undefined) rule.isActive = isActive;

    const effectiveFrequency = frequency || rule.frequency;
    const effectiveStartDate = startDate ? normalizeDate(startDate) : rule.startDate;

    if (frequency !== undefined) rule.frequency = frequency;
    if (startDate !== undefined) rule.startDate = effectiveStartDate;

    if (frequency !== undefined || startDate !== undefined || isActive !== undefined) {
      rule.nextRunDate = getFirstRunDate(effectiveStartDate, effectiveFrequency);
      rule.lastRunDate = null;
    }

    await rule.save();
    await rule.populate('categoryId', 'name type');

    res.json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete recurring transaction rule
router.delete('/:id', async (req, res) => {
  try {
    const rule = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!rule) {
      return res.status(404).json({ message: 'Recurring rule not found' });
    }

    res.json({ message: 'Recurring rule deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

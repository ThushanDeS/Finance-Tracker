const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  note: { type: String, default: '' },
  frequency: { type: String, enum: ['Weekly', 'Monthly', 'Yearly'], required: true },
  startDate: { type: Date, required: true },
  nextRunDate: { type: Date, required: true },
  lastRunDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);

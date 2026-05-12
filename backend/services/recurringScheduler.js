const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const { addFrequency, normalizeDate } = require('../utils/recurringUtils');

let schedulerInterval = null;
let isProcessing = false;

const processRecurringTransactions = async () => {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    const now = normalizeDate(new Date());
    const dueRules = await RecurringTransaction.find({
      isActive: true,
      nextRunDate: { $lte: now },
    });

    for (const rule of dueRules) {
      let runDate = normalizeDate(rule.nextRunDate);
      let lastRunDate = rule.lastRunDate;

      while (runDate <= now) {
        await Transaction.create({
          userId: rule.userId,
          title: rule.title,
          amount: rule.amount,
          categoryId: rule.categoryId,
          type: rule.type,
          note: rule.note,
          date: runDate,
        });

        lastRunDate = runDate;
        runDate = addFrequency(runDate, rule.frequency);
      }

      rule.lastRunDate = lastRunDate;
      rule.nextRunDate = runDate;
      await rule.save();
    }
  } catch (err) {
    console.error('Recurring scheduler error:', err.message);
  } finally {
    isProcessing = false;
  }
};

const startRecurringScheduler = () => {
  if (schedulerInterval) {
    return;
  }

  processRecurringTransactions();
  schedulerInterval = setInterval(processRecurringTransactions, 60 * 1000);
};

module.exports = {
  startRecurringScheduler,
};

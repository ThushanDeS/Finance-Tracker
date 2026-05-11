require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { startRecurringScheduler } = require('./services/recurringScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #1e3a8a; }',
  customSiteTitle: 'Finance Tracker API Docs',
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/recurring-transactions', require('./routes/recurringTransactions'));

// Dashboard Stats Route
app.get('/api/stats', require('./middleware/auth'), async (req, res) => {
  try {
    const Transaction = require('./models/Transaction');
    const stats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = stats.find(s => s._id === 'Income')?.total || 0;
    const expenses = stats.find(s => s._id === 'Expense')?.total || 0;

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Only start the server when this file is run directly (not imported by tests)
if (require.main === module) {
  connectDB().then(() => {
    startRecurringScheduler();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;

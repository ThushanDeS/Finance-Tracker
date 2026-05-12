const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// @route   GET api/reports/export
// @route   GET api/reports/export
router.get('/export', auth, async (req, res) => {
  try {
    const { month, year } = req.query; // Expecting month (1-12) and year (e.g. 2026)
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and Year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    console.log(`Exporting PDF for ${month}/${year} for user ${req.user.userId}`);

    const transactions = await Transaction.find({ 
      userId: req.user.userId,
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .populate('categoryId', 'name')
      .lean();

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ message: `No transactions found for ${month}/${year}`, count: 0 });
    }

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const fileName = `Financial_Report_${monthName}_${year}`;

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
    doc.pipe(res);

    // PDF Header
    doc.fontSize(22).font('Helvetica-Bold').text('Financial Statement', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').text(`${monthName} ${year}`, { align: 'center', color: '#64748b' });
    doc.moveDown(2);

    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Table Header
    const tableTop = 160;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 30, tableTop);
    doc.text('Title', 100, tableTop);
    doc.text('Category', 250, tableTop);
    doc.text('Type', 350, tableTop);
    doc.text('Amount (Rs.)', 450, tableTop, { align: 'right' });
    doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();

    let y = tableTop + 25;
    let totalIncome = 0;
    let totalExpense = 0;

    doc.font('Helvetica');
    transactions.forEach(t => {
      if (y > 700) { doc.addPage(); y = 50; }
      
      const amount = Number(t.amount || 0);
      if (t.type === 'Income') totalIncome += amount;
      else totalExpense += amount;

      doc.text(new Date(t.date).toLocaleDateString(), 30, y);
      doc.text(String(t.title || 'Untitled').substring(0, 30), 100, y);
      doc.text(String(t.categoryId?.name || 'Uncategorized'), 250, y);
      doc.text(String(t.type || 'N/A'), 350, y);
      doc.text(amount.toLocaleString(undefined, { minimumFractionDigits: 2 }), 450, y, { align: 'right' });
      y += 20;
    });

    // Summary
    if (y > 650) { doc.addPage(); y = 50; }
    y += 20;
    doc.moveTo(350, y).lineTo(570, y).stroke();
    y += 10;
    doc.font('Helvetica-Bold');
    doc.text('Total Income:', 350, y);
    doc.text(`Rs. ${totalIncome.toLocaleString()}`, 450, y, { align: 'right' });
    y += 20;
    doc.text('Total Expenses:', 350, y);
    doc.text(`Rs. ${totalExpense.toLocaleString()}`, 450, y, { align: 'right' });
    y += 20;
    doc.fontSize(12).text('Net Balance:', 350, y);
    doc.text(`Rs. ${(totalIncome - totalExpense).toLocaleString()}`, 450, y, { align: 'right' });

    doc.end();
  } catch (err) {
    console.error('Export Error:', err);
    res.status(500).json({ message: 'Server error during report generation', error: err.message });
  }
});

// Add a test route to confirm registration
router.get('/ping', (req, res) => res.send('Reports route is working'));

module.exports = router;

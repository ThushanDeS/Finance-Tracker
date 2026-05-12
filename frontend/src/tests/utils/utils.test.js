import { describe, test, expect } from 'vitest';

// Utility functions being tested
const formatCurrency = (amount) => `Rs. ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const calculateBalance = (income, expenses) => income - expenses;

const filterByDateRange = (transactions, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date >= start && date <= end;
  });
};

describe('formatCurrency', () => {
  test('displays Rs. prefix', () => {
    expect(formatCurrency(5000)).toContain('Rs.');
  });

  test('formats with 2 decimal places', () => {
    expect(formatCurrency(1000)).toContain('1,000.00');
  });

  test('handles zero', () => {
    expect(formatCurrency(0)).toContain('0.00');
  });

  test('handles large amounts', () => {
    expect(formatCurrency(1000000)).toContain('1,000,000.00');
  });
});

describe('calculateBalance', () => {
  test('returns correct positive balance', () => {
    expect(calculateBalance(10000, 3000)).toBe(7000);
  });

  test('returns negative when expenses exceed income', () => {
    expect(calculateBalance(2000, 5000)).toBe(-3000);
  });

  test('returns zero when income equals expenses', () => {
    expect(calculateBalance(5000, 5000)).toBe(0);
  });
});

describe('filterByDateRange', () => {
  const sampleTransactions = [
    { title: 'January', date: '2026-01-15', amount: 100 },
    { title: 'March', date: '2026-03-10', amount: 200 },
    { title: 'May', date: '2026-05-01', amount: 300 },
  ];

  test('returns only transactions within the range', () => {
    const result = filterByDateRange(sampleTransactions, '2026-02-01', '2026-04-30');
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('March');
  });

  test('returns empty array when no matches', () => {
    const result = filterByDateRange(sampleTransactions, '2025-01-01', '2025-12-31');
    expect(result.length).toBe(0);
  });

  test('returns all when range covers everything', () => {
    const result = filterByDateRange(sampleTransactions, '2026-01-01', '2026-12-31');
    expect(result.length).toBe(3);
  });
});

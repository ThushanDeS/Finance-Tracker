import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock the api module
vi.mock('../../api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1', email: 'test@example.com' },
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }) => children,
}));

import api from '../../api/api';
import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';

describe('Login Component', () => {

  test('renders login form with email and password fields', () => {
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>);
    // The form has type="email" and type="password" inputs
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  test('renders a submit button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});

describe('Dashboard Component', () => {

  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/stats') {
        return Promise.resolve({
          data: { totalIncome: 50000, totalExpenses: 20000, balance: 30000 }
        });
      }
      if (url === '/transactions') {
        return Promise.resolve({
          data: [
            { _id: '1', title: 'Salary', amount: 50000, type: 'Income', date: new Date().toISOString(), categoryId: { name: 'Salary' } },
            { _id: '2', title: 'Rent', amount: 20000, type: 'Expense', date: new Date().toISOString(), categoryId: { name: 'Housing' } },
          ]
        });
      }
      if (url === '/budgets') {
        return Promise.resolve({
          data: [
            {
              _id: 'budget1',
              amount: 15000,
              spentAmount: 22000,
              categoryId: { name: 'Rent' },
            },
            {
              _id: 'budget2',
              amount: 10000,
              spentAmount: 8000,
              categoryId: { name: 'Groceries' },
            },
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  test('shows loading state initially', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows total income, expenses and balance after loading', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    // Use findAllByText since the same amount may appear in both the stat card and the transactions list
    const incomeEls = await screen.findAllByText(/50,000/);
    expect(incomeEls.length).toBeGreaterThan(0);
    const expenseEls = await screen.findAllByText(/20,000/);
    expect(expenseEls.length).toBeGreaterThan(0);
    const balanceEls = await screen.findAllByText(/30,000/);
    expect(balanceEls.length).toBeGreaterThan(0);
  });

  test('shows recent transactions', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(await screen.findByText('Salary')).toBeInTheDocument();
    expect(await screen.findByText('Rent')).toBeInTheDocument();
  });


});

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  }
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1', email: 'test@example.com' },
    logout: vi.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }) => children,
}));

import api from '../../api/api';
import Budgets from '../../pages/Budgets';

const mockBudgets = [
  {
    _id: 'b1',
    categoryId: { _id: 'c1', name: 'Food' },
    amount: 10000,
    spentAmount: 4000,
    progress: 40,
  },
  {
    _id: 'b2',
    categoryId: { _id: 'c2', name: 'Rent' },
    amount: 20000,
    spentAmount: 25000,
    progress: 125,  // Exceeded!
  },
];

const mockCategories = [
  { _id: 'c1', name: 'Food', type: 'Expense' },
  { _id: 'c2', name: 'Rent', type: 'Expense' },
];

describe('Budgets Component', () => {

  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/budgets') return Promise.resolve({ data: mockBudgets });
      if (url === '/categories') return Promise.resolve({ data: mockCategories });
      return Promise.resolve({ data: [] });
    });
  });

  test('shows loading state initially', () => {
    render(<MemoryRouter><Budgets /></MemoryRouter>);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders budget category names after loading', async () => {
    render(<MemoryRouter><Budgets /></MemoryRouter>);
    // category names appear in multiple places (headers + select options), use findAllByText
    const foodEls = await screen.findAllByText('Food');
    expect(foodEls.length).toBeGreaterThan(0);
    const rentEls = await screen.findAllByText('Rent');
    expect(rentEls.length).toBeGreaterThan(0);
  });

  test('shows "Budget Exceeded!" for budgets over 100% progress', async () => {
    render(<MemoryRouter><Budgets /></MemoryRouter>);
    expect(await screen.findByText(/Budget Exceeded!/i)).toBeInTheDocument();
  });

  test('shows "Approaching Limit" for budgets between 80-100% progress', async () => {
    api.get.mockImplementationOnce(() => Promise.resolve({
      data: [{ _id: 'b3', categoryId: { _id: 'c1', name: 'Food' }, amount: 10000, spentAmount: 9000, progress: 90 }]
    }));
    api.get.mockImplementationOnce(() => Promise.resolve({ data: mockCategories }));

    render(<MemoryRouter><Budgets /></MemoryRouter>);
    expect(await screen.findByText(/Approaching Limit/i)).toBeInTheDocument();
  });
});

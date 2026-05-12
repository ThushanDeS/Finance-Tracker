const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./setup');
const app = require('../server');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Integration Tests', () => {

  describe('Protected Routes', () => {
    test('should reject all protected routes without a token', async () => {
      const routes = [
        { method: 'get', path: '/api/transactions' },
        { method: 'get', path: '/api/budgets' },
        { method: 'get', path: '/api/categories' },
        { method: 'get', path: '/api/stats' },
        { method: 'get', path: '/api/auth/me' },
      ];
      for (const { method, path } of routes) {
        const res = await request(app)[method](path);
        expect(res.status).toBe(401);
      }
    });
  });

  describe('Complete user flow: Register → Login → Add Transaction', () => {
    test('should complete successfully end-to-end', async () => {
      // Register
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ email: 'flow@example.com', password: 'password123' });
      expect(regRes.status).toBe(201);

      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'flow@example.com', password: 'password123' });
      expect(loginRes.status).toBe(200);
      const token = loginRes.body.token;

      // Create category
      const catRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Freelance', type: 'Income' });
      expect(catRes.status).toBe(201);

      // Add transaction
      const txRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Freelance', amount: 15000, categoryId: catRes.body._id, type: 'Income', date: new Date().toISOString() });
      expect(txRes.status).toBe(201);

      // Check stats
      const statsRes = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${token}`);
      expect(statsRes.body.totalIncome).toBe(15000);
      expect(statsRes.body.balance).toBe(15000);
    });
  });

  describe('Budget alert flow', () => {
    test('should show budget exceeded when spending surpasses budget limit', async () => {
      const { body: { token } } = await request(app)
        .post('/api/auth/register')
        .send({ email: 'alert@example.com', password: 'password123' });

      const { body: cat } = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Rent', type: 'Expense' });

      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoryId: cat._id, amount: 20000 });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Rent', amount: 25000, categoryId: cat._id, type: 'Expense', date: new Date().toISOString() });

      const { body: budgets } = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(budgets[0].progress).toBeGreaterThan(100);
    });
  });

  describe('Transaction CRUD lifecycle', () => {
    test('should create, read, update and delete', async () => {
      const { body: { token } } = await request(app)
        .post('/api/auth/register')
        .send({ email: 'crud@example.com', password: 'password123' });

      const { body: cat } = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Groceries', type: 'Expense' });

      // CREATE
      const { body: tx } = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Supermarket', amount: 3000, categoryId: cat._id, type: 'Expense', date: new Date().toISOString() });
      expect(tx).toHaveProperty('_id');

      // READ
      const listRes = await request(app).get('/api/transactions').set('Authorization', `Bearer ${token}`);
      expect(listRes.body.length).toBe(1);

      // UPDATE
      const updateRes = await request(app)
        .put(`/api/transactions/${tx._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 3500 });
      expect(updateRes.body.amount).toBe(3500);

      // DELETE
      await request(app).delete(`/api/transactions/${tx._id}`).set('Authorization', `Bearer ${token}`);
      const afterDelete = await request(app).get('/api/transactions').set('Authorization', `Bearer ${token}`);
      expect(afterDelete.body.length).toBe(0);
    });
  });
});

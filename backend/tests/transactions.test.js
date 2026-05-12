const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./setup');
const app = require('../server');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

// Helper: register and get auth token
const registerUser = async (email = 'user@example.com') => {
  const { body } = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'password123' });
  return body;
};

// Helper: create a category
const createCategory = async (token, name = 'Salary', type = 'Income') => {
  const { body } = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, type });
  return body;
};

// Helper: create a transaction
const createTransaction = (token, categoryId, overrides = {}) =>
  request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Income',
      amount: 5000,
      categoryId,
      type: 'Income',
      date: new Date().toISOString(),
      note: '',
      ...overrides
    });

describe('Transaction Controller', () => {

  describe('POST /api/transactions', () => {

    test('should create a transaction for authenticated user', async () => {
      const { token } = await registerUser('tx1@example.com');
      const cat = await createCategory(token);

      const res = await createTransaction(token, cat._id);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Income');
      expect(res.body).toHaveProperty('amount', 5000);
    });

    test('should prevent negative amounts', async () => {
      const { token } = await registerUser('tx2@example.com');
      const cat = await createCategory(token);

      const res = await createTransaction(token, cat._id, { amount: -100 });
      expect(res.status).toBe(400);
    });

    test('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ title: 'Hack', amount: 100, type: 'Income', date: new Date() });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions', () => {

    test("should return only the authenticated user's transactions", async () => {
      const { token } = await registerUser('tx3@example.com');
      const cat = await createCategory(token);

      await createTransaction(token, cat._id, { title: 'Mine' });

      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Mine');
    });

    test('should filter transactions by date range', async () => {
      const { token } = await registerUser('tx4@example.com');
      const cat = await createCategory(token);

      await createTransaction(token, cat._id, { title: 'Old', date: '2024-01-15' });
      await createTransaction(token, cat._id, { title: 'New', date: '2026-05-01' });

      const res = await request(app)
        .get('/api/transactions?startDate=2026-01-01&endDate=2026-12-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('New');
    });

    test('should calculate total income correctly via /api/stats', async () => {
      const { token } = await registerUser('tx5@example.com');
      const cat = await createCategory(token);

      await createTransaction(token, cat._id, { title: 'Income1', amount: 3000 });
      await createTransaction(token, cat._id, { title: 'Income2', amount: 2000 });

      const res = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalIncome).toBe(5000);
      expect(res.body.balance).toBe(5000);
    });
  });

  describe('DELETE /api/transactions/:id', () => {

    test('should delete a transaction belonging to the user', async () => {
      const { token } = await registerUser('tx6@example.com');
      const cat = await createCategory(token);

      const created = await createTransaction(token, cat._id);
      const txId = created.body._id;

      const res = await request(app)
        .delete(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const listRes = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);
      expect(listRes.body.length).toBe(0);
    });
  });
});

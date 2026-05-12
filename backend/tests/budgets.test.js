const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./setup');
const app = require('../server');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

const registerUser = async (email) => {
  const { body } = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'password123' });
  return body;
};

const createCategory = async (token, name, type = 'Expense') => {
  const { body } = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, type });
  return body;
};

const createBudget = (token, categoryId, amount) =>
  request(app)
    .post('/api/budgets')
    .set('Authorization', `Bearer ${token}`)
    .send({ categoryId, amount });

const createTransaction = (token, categoryId, amount, type = 'Expense') =>
  request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test', amount, categoryId, type, date: new Date().toISOString() });

describe('Budget Controller', () => {

  describe('POST /api/budgets', () => {

    test('should create a new budget', async () => {
      const { token } = await registerUser('b1@example.com');
      const cat = await createCategory(token, 'Food');

      const res = await createBudget(token, cat._id, 10000);
      expect(res.status).toBe(201);
      expect(res.body.amount).toBe(10000);
    });

    test('should reject negative budget amounts', async () => {
      const { token } = await registerUser('b2@example.com');
      const cat = await createCategory(token, 'Food');

      const res = await createBudget(token, cat._id, -500);
      expect(res.status).toBe(400);
    });

    test('should upsert budget for same category (no duplicate)', async () => {
      const { token } = await registerUser('b3@example.com');
      const cat = await createCategory(token, 'Rent');

      await createBudget(token, cat._id, 5000);
      await createBudget(token, cat._id, 8000);

      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.length).toBe(1);
      expect(res.body[0].amount).toBe(8000);
    });
  });

  describe('GET /api/budgets (progress calculation)', () => {

    test('should calculate budget progress correctly', async () => {
      const { token } = await registerUser('b4@example.com');
      const cat = await createCategory(token, 'Groceries');

      await createBudget(token, cat._id, 10000);
      await createTransaction(token, cat._id, 4000);

      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body[0].spentAmount).toBe(4000);
      expect(res.body[0].progress).toBe(40);
    });

    test('should detect when spending exceeds budget (progress > 100)', async () => {
      const { token } = await registerUser('b5@example.com');
      const cat = await createCategory(token, 'Entertainment');

      await createBudget(token, cat._id, 1000);
      await createTransaction(token, cat._id, 1500);

      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body[0].progress).toBeGreaterThan(100);
    });

    test('should show 0 progress when no spending', async () => {
      const { token } = await registerUser('b6@example.com');
      const cat = await createCategory(token, 'Travel');

      await createBudget(token, cat._id, 5000);

      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body[0].progress).toBe(0);
      expect(res.body[0].spentAmount).toBe(0);
    });
  });
});

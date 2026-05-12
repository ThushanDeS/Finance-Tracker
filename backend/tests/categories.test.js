const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./setup');
const app = require('../server');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Category Routes', () => {
  test('should reject duplicate category names for the same user', async () => {
    const { body: { token } } = await request(app)
      .post('/api/auth/register')
      .send({ email: 'categories@example.com', password: 'password123' });

    const firstResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Groceries', type: 'Expense' });

    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'groceries', type: 'Income' });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.message).toMatch(/already exists/i);
  });

  test('should reject renaming a category to an existing name', async () => {
    const { body: { token } } = await request(app)
      .post('/api/auth/register')
      .send({ email: 'rename@example.com', password: 'password123' });

    const { body: firstCategory } = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Transport', type: 'Expense' });

    const { body: secondCategory } = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Food', type: 'Expense' });

    const updateResponse = await request(app)
      .put(`/api/categories/${secondCategory._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'transport', type: 'Expense' });

    expect(updateResponse.status).toBe(409);
    expect(updateResponse.body.message).toMatch(/already exists/i);

    const sameNameUpdate = await request(app)
      .put(`/api/categories/${firstCategory._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Transport', type: 'Expense' });

    expect(sameNameUpdate.status).toBe(200);
  });
});
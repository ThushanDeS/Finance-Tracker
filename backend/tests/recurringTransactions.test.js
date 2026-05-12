const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./setup');
const app = require('../server');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Recurring Transactions Routes', () => {
  const createUserAndCategory = async () => {
    const { body: { token } } = await request(app)
      .post('/api/auth/register')
      .send({ email: 'recurring@example.com', password: 'password123' });

    const { body: category } = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rent', type: 'Expense' });

    return { token, category };
  };

  test('should create and list recurring transaction rules', async () => {
    const { token, category } = await createUserAndCategory();

    const createResponse = await request(app)
      .post('/api/recurring-transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Monthly Rent',
        amount: 12000,
        categoryId: category._id,
        type: 'Expense',
        frequency: 'Monthly',
        startDate: new Date().toISOString(),
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('title', 'Monthly Rent');

    const listResponse = await request(app)
      .get('/api/recurring-transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toHaveProperty('frequency', 'Monthly');
  });

  test('should update and delete recurring transaction rules', async () => {
    const { token, category } = await createUserAndCategory();

    const { body: createdRule } = await request(app)
      .post('/api/recurring-transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Electricity Bill',
        amount: 3500,
        categoryId: category._id,
        type: 'Expense',
        frequency: 'Monthly',
        startDate: new Date().toISOString(),
      });

    const updateResponse = await request(app)
      .put(`/api/recurring-transactions/${createdRule._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        frequency: 'Weekly',
        isActive: false,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty('frequency', 'Weekly');
    expect(updateResponse.body).toHaveProperty('isActive', false);

    const deleteResponse = await request(app)
      .delete(`/api/recurring-transactions/${createdRule._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);

    const listResponse = await request(app)
      .get('/api/recurring-transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.body).toHaveLength(0);
  });
});

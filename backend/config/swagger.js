const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Tracker API',
      version: '1.0.0',
      description: 'REST API for the Finance Tracker application. Use the Authorize button below to enter your JWT token (format: `Bearer <token>`) to test protected routes.',
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Local Development Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6a013e1906035227ee1b3f10' },
            email: { type: 'string', example: 'user@example.com' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Groceries' },
            type: { type: 'string', enum: ['Income', 'Expense'] },
            userId: { type: 'string' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Monthly Salary' },
            amount: { type: 'number', example: 50000 },
            type: { type: 'string', enum: ['Income', 'Expense'] },
            date: { type: 'string', format: 'date', example: '2026-05-01' },
            note: { type: 'string', example: 'May salary' },
            categoryId: { $ref: '#/components/schemas/Category' },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            amount: { type: 'number', example: 10000 },
            spentAmount: { type: 'number', example: 4000 },
            progress: { type: 'number', example: 40 },
            categoryId: { $ref: '#/components/schemas/Category' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Server error' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJSDoc(options);

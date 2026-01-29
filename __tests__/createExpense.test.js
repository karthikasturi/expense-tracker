const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

jest.mock('uuid');

const app = express();
app.use(express.json());

const expenses = [];

const validateExpense = (data) => {
  const errors = [];
  if (!data.title || data.title.length < 3 || data.title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be between 3 and 100 characters' });
  }
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  }
  if (!data.category || typeof data.category !== 'string') {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push({ field: 'date', message: 'Valid date is required' });
  }
  if (data.description && data.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must not exceed 500 characters' });
  }
  return errors;
};

app.post('/api/v1/expenses', (req, res) => {
  try {
    const errors = validateExpense(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors }
      });
    }

    const expense = {
      id: uuidv4(),
      ...req.body,
      date: new Date(req.body.date).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    expenses.push(expense);
    res.status(201).json({ success: true, data: expense, message: 'Expense created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

describe('POST /api/v1/expenses', () => {
  beforeEach(() => {
    expenses.length = 0;
    uuidv4.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');
  });

  const validTestCases = [
    {
      name: 'valid expense with all fields',
      input: { title: 'Grocery Shopping', amount: 150.50, category: 'Food', date: '2024-01-15', description: 'Weekly groceries' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'valid expense without optional description',
      input: { title: 'Gas Station', amount: 50.00, category: 'Transport', date: '2024-01-16' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'minimum valid title length (3 chars)',
      input: { title: 'ABC', amount: 10.00, category: 'Test', date: '2024-01-15' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'maximum valid title length (100 chars)',
      input: { title: 'A'.repeat(100), amount: 10.00, category: 'Test', date: '2024-01-15' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'minimum positive amount (0.01)',
      input: { title: 'Small expense', amount: 0.01, category: 'Test', date: '2024-01-15' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'large amount value',
      input: { title: 'Large expense', amount: 999999.99, category: 'Test', date: '2024-01-15' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'maximum description length (500 chars)',
      input: { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15', description: 'A'.repeat(500) },
      expected: { statusCode: 201, success: true }
    }
  ];

  describe('Valid Input Cases', () => {
    test.each(validTestCases)('$name', async ({ input, expected }) => {
      const response = await request(app).post('/api/v1/expenses').send(input);
      expect(response.status).toBe(expected.statusCode);
      expect(response.body.success).toBe(expected.success);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });
  });

  const invalidTestCases = [
    {
      name: 'missing title',
      input: { amount: 150.50, category: 'Food', date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'title' }
    },
    {
      name: 'title too short (2 chars)',
      input: { title: 'AB', amount: 150.50, category: 'Food', date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'title' }
    },
    {
      name: 'title too long (101 chars)',
      input: { title: 'A'.repeat(101), amount: 150.50, category: 'Food', date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'title' }
    },
    {
      name: 'missing amount',
      input: { title: 'Grocery Shopping', category: 'Food', date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'amount' }
    },
    {
      name: 'zero amount',
      input: { title: 'Grocery Shopping', amount: 0, category: 'Food', date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'amount' }
    },
    {
      name: 'negative amount',
      input: { title: 'Grocery Shopping', amount: -50.00, category: 'Food', date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'amount' }
    },
    {
      name: 'amount as string',
      input: { title: 'Grocery Shopping', amount: '150.50', category: 'Food', date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'amount' }
    },
    {
      name: 'missing category',
      input: { title: 'Grocery Shopping', amount: 150.50, date: '2024-01-15' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'category' }
    },
    {
      name: 'missing date',
      input: { title: 'Grocery Shopping', amount: 150.50, category: 'Food' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'date' }
    },
    {
      name: 'invalid date format',
      input: { title: 'Grocery Shopping', amount: 150.50, category: 'Food', date: 'invalid-date' },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'date' }
    },
    {
      name: 'description too long (501 chars)',
      input: { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15', description: 'A'.repeat(501) },
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR', field: 'description' }
    },
    {
      name: 'empty request body',
      input: {},
      expected: { statusCode: 400, errorCode: 'VALIDATION_ERROR' }
    }
  ];

  describe('Invalid Input Cases', () => {
    test.each(invalidTestCases)('$name', async ({ input, expected }) => {
      const response = await request(app).post('/api/v1/expenses').send(input);
      expect(response.status).toBe(expected.statusCode);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(expected.errorCode);
      if (expected.field) {
        expect(response.body.error.details.some(d => d.field === expected.field)).toBe(true);
      }
    });
  });

  const edgeCases = [
    {
      name: 'decimal amount with many decimal places',
      input: { title: 'Test', amount: 123.456789, category: 'Test', date: '2024-01-15' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'date with time component',
      input: { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15T10:30:00Z' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'special characters in title',
      input: { title: 'Test @#$%', amount: 10.00, category: 'Test', date: '2024-01-15' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'unicode characters in description',
      input: { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15', description: '测试 🎉' },
      expected: { statusCode: 201, success: true }
    },
    {
      name: 'empty string description',
      input: { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15', description: '' },
      expected: { statusCode: 201, success: true }
    }
  ];

  describe('Edge Cases', () => {
    test.each(edgeCases)('$name', async ({ input, expected }) => {
      const response = await request(app).post('/api/v1/expenses').send(input);
      expect(response.status).toBe(expected.statusCode);
      expect(response.body.success).toBe(expected.success);
    });
  });

  describe('Response Structure', () => {
    test('should return correct response structure on success', async () => {
      const input = { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15' };
      const response = await request(app).post('/api/v1/expenses').send(input);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Expense created successfully');
      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        title: input.title,
        amount: input.amount,
        category: input.category,
        date: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    test('should return correct error structure on validation failure', async () => {
      const response = await request(app).post('/api/v1/expenses').send({});
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('message', 'Validation failed');
      expect(response.body.error).toHaveProperty('details');
      expect(Array.isArray(response.body.error.details)).toBe(true);
    });
  });

  describe('UUID Generation', () => {
    test('should generate unique ID for each expense', async () => {
      uuidv4.mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');
      
      const input = { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15' };
      const response1 = await request(app).post('/api/v1/expenses').send(input);
      const response2 = await request(app).post('/api/v1/expenses').send(input);
      
      expect(response1.body.data.id).toBe('id-1');
      expect(response2.body.data.id).toBe('id-2');
    });
  });

  describe('Content-Type Handling', () => {
    test('should handle JSON content type', async () => {
      const input = { title: 'Test', amount: 10.00, category: 'Test', date: '2024-01-15' };
      const response = await request(app)
        .post('/api/v1/expenses')
        .set('Content-Type', 'application/json')
        .send(input);
      
      expect(response.status).toBe(201);
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/expenses')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');
      
      expect(response.status).toBe(400);
    });
  });

  describe('Multiple Validation Errors', () => {
    test('should return all validation errors at once', async () => {
      const response = await request(app).post('/api/v1/expenses').send({
        title: 'AB',
        amount: -10,
        category: '',
        date: 'invalid'
      });
      
      expect(response.status).toBe(400);
      expect(response.body.error.details.length).toBeGreaterThan(1);
    });
  });
});

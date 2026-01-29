const { v4: uuidv4 } = require('uuid');
const { addExpense } = require('../models/expenseModel');
const { validateExpense } = require('../middleware/validator');

const createExpense = (req, res) => {
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
    
    addExpense(expense);
    res.status(201).json({ success: true, data: expense, message: 'Expense created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

module.exports = { createExpense };

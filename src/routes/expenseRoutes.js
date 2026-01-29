const express = require('express');
const { createExpense } = require('../controllers/expenseController');

const router = express.Router();

router.post('/expenses', createExpense);

module.exports = router;

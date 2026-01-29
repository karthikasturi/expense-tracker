const expenses = [];

const addExpense = (expense) => {
  expenses.push(expense);
  return expense;
};

const getAllExpenses = () => expenses;

module.exports = { addExpense, getAllExpenses };

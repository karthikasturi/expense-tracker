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

module.exports = { validateExpense };

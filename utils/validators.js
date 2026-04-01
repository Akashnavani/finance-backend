const { ROLE_VALUES, TRANSACTION_TYPE_VALUES } = require('../config/constants');

/**
 * Validates user registration input.
 * Returns { isValid: boolean, errors: string[] }
 */
const validateRegisterInput = ({ name, email, password, role }) => {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (role && !ROLE_VALUES.includes(role)) {
    errors.push(`Role must be one of: ${ROLE_VALUES.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validates login input.
 */
const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validates transaction creation/update input.
 */
const validateTransactionInput = ({ amount, type, category, date }) => {
  const errors = [];

  if (amount === undefined || amount === null) {
    errors.push('Amount is required');
  } else if (isNaN(amount) || Number(amount) <= 0) {
    errors.push('Amount must be a number greater than 0');
  }

  if (!type) {
    errors.push('Type is required');
  } else if (!TRANSACTION_TYPE_VALUES.includes(type)) {
    errors.push(`Type must be one of: ${TRANSACTION_TYPE_VALUES.join(', ')}`);
  }

  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!date) {
    errors.push('Date is required');
  } else if (isNaN(Date.parse(date))) {
    errors.push('Date must be a valid date (YYYY-MM-DD)');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validates role update input.
 */
const validateRoleUpdate = ({ role }) => {
  const errors = [];

  if (!role) {
    errors.push('Role is required');
  } else if (!ROLE_VALUES.includes(role)) {
    errors.push(`Role must be one of: ${ROLE_VALUES.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateTransactionInput,
  validateRoleUpdate
};

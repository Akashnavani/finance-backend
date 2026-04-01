/**
 * Application-wide constants.
 * All enum values and magic strings are centralized here.
 * No hardcoded values anywhere else in the codebase.
 */

const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// All valid role values as an array (useful for ENUM definitions and validation)
const ROLE_VALUES = Object.values(ROLES);
const STATUS_VALUES = Object.values(USER_STATUS);
const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPES);

module.exports = {
  ROLES,
  USER_STATUS,
  TRANSACTION_TYPES,
  ROLE_VALUES,
  STATUS_VALUES,
  TRANSACTION_TYPE_VALUES
};

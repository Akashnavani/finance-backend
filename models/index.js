const sequelize = require('../config/db');
const User = require('./User');
const Transaction = require('./Transaction');

// --------------- Associations ---------------
// A User can have many Transactions
User.hasMany(Transaction, {
  foreignKey: 'createdBy',
  as: 'transactions',
  onDelete: 'CASCADE'
});

// Each Transaction belongs to one User
Transaction.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// --------------- Export everything as a single db object ---------------
const db = {
  sequelize,
  User,
  Transaction
};

module.exports = db;

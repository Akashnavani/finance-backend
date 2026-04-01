const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { TRANSACTION_TYPE_VALUES, TRANSACTION_TYPES } = require('../config/constants');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Amount must be a valid number' },
      min: {
        args: [0.01],
        msg: 'Amount must be greater than 0'
      }
    }
  },
  type: {
    type: DataTypes.ENUM(...TRANSACTION_TYPE_VALUES),
    allowNull: false,
    validate: {
      isIn: {
        args: [TRANSACTION_TYPE_VALUES],
        msg: `Type must be one of: ${TRANSACTION_TYPE_VALUES.join(', ')}`
      }
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Category cannot be empty' }
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Must be a valid date (YYYY-MM-DD)' }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    { fields: ['isDeleted', 'date'] },
    { fields: ['createdBy'] },
    { fields: ['category'] }
  ]
});

module.exports = Transaction;

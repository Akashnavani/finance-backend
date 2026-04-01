const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  softDeleteTransaction
} = require('../controllers/transactionController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../config/constants');

// All transaction routes require authentication
router.use(auth);

// Read access: all roles (Viewer scoped to own data in controller)
router.get('/', authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN), getAllTransactions);
router.get('/:id', authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN), getTransactionById);

// Write access: admin only
router.post('/', authorize(ROLES.ADMIN), createTransaction);
router.put('/:id', authorize(ROLES.ADMIN), updateTransaction);
router.delete('/:id', authorize(ROLES.ADMIN), softDeleteTransaction);

module.exports = router;

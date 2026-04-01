const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentTransactions
} = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../config/constants');

// All dashboard routes require auth + viewer/analyst/admin access
router.use(auth, authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN));

router.get('/summary', getSummary);
router.get('/category-totals', getCategoryTotals);
router.get('/trends', getMonthlyTrends);
router.get('/recent', getRecentTransactions);

module.exports = router;

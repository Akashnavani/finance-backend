const { sequelize, Transaction } = require('../models');
const { QueryTypes } = require('sequelize');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/dashboard/summary
 * Returns total income, total expenses, and net balance.
 *
 * Uses a SINGLE SQL query with SUM(CASE WHEN ...) to compute all three
 * values in one database round-trip. No application-level math.
 */
const getSummary = async (req, res, next) => {
  try {
    const isViewer = req.user.role === 'viewer';
    const userFilter = isViewer ? 'AND createdBy = :userId' : '';
    const replacements = isViewer ? { userId: req.user.id } : {};

    const [result] = await sequelize.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
          0
        ) AS netBalance
      FROM transactions
      WHERE isDeleted = false ${userFilter}`,
      { type: QueryTypes.SELECT, replacements }
    );

    res.status(200).json(
      new ApiResponse(200, {
        totalIncome: parseFloat(result.totalIncome),
        totalExpenses: parseFloat(result.totalExpenses),
        netBalance: parseFloat(result.netBalance)
      }, 'Dashboard summary fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/category-totals
 * Returns total amount grouped by category.
 * Uses GROUP BY with SUM aggregate.
 */
const getCategoryTotals = async (req, res, next) => {
  try {
    const isViewer = req.user.role === 'viewer';
    const userFilter = isViewer ? 'AND createdBy = :userId' : '';
    const replacements = isViewer ? { userId: req.user.id } : {};

    const results = await sequelize.query(
      `SELECT
        category,
        type,
        COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE isDeleted = false ${userFilter}
      GROUP BY category, type
      ORDER BY total DESC`,
      { type: QueryTypes.SELECT, replacements }
    );

    // Parse amounts to numbers
    const categoryTotals = results.map((row) => ({
      category: row.category,
      type: row.type,
      total: parseFloat(row.total)
    }));

    res.status(200).json(
      new ApiResponse(200, { categoryTotals }, 'Category totals fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/trends
 * Returns monthly income and expense trends.
 * Uses DATE_FORMAT for month grouping, SUM(CASE WHEN) for type separation.
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const isViewer = req.user.role === 'viewer';
    const userFilter = isViewer ? 'AND createdBy = :userId' : '';
    const replacements = isViewer ? { userId: req.user.id } : {};

    const results = await sequelize.query(
      `SELECT
        DATE_FORMAT(date, '%Y-%m') AS month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
      FROM transactions
      WHERE isDeleted = false ${userFilter}
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC`,
      { type: QueryTypes.SELECT, replacements }
    );

    const trends = results.map((row) => ({
      month: row.month,
      income: parseFloat(row.income),
      expenses: parseFloat(row.expenses)
    }));

    res.status(200).json(
      new ApiResponse(200, { trends }, 'Monthly trends fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/recent
 * Returns the 5 most recent non-deleted transactions.
 */
const getRecentTransactions = async (req, res, next) => {
  try {
    const isViewer = req.user.role === 'viewer';
    const userFilter = isViewer ? 'AND t.createdBy = :userId' : '';
    const replacements = isViewer ? { userId: req.user.id } : {};

    const results = await sequelize.query(
      `SELECT
        t.id, t.amount, t.type, t.category, t.date, t.notes, t.createdAt,
        u.id AS creatorId, u.name AS creatorName
      FROM transactions t
      JOIN users u ON t.createdBy = u.id
      WHERE t.isDeleted = false ${userFilter}
      ORDER BY t.date DESC, t.createdAt DESC
      LIMIT 5`,
      { type: QueryTypes.SELECT, replacements }
    );

    const transactions = results.map((row) => ({
      id: row.id,
      amount: parseFloat(row.amount),
      type: row.type,
      category: row.category,
      date: row.date,
      notes: row.notes,
      createdAt: row.createdAt,
      creator: {
        id: row.creatorId,
        name: row.creatorName
      }
    }));

    res.status(200).json(
      new ApiResponse(200, { transactions }, 'Recent transactions fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentTransactions };

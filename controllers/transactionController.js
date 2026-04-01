const { Op } = require('sequelize');
const { Transaction, User } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { validateTransactionInput } = require('../utils/validators');
const { ROLES } = require('../config/constants');

/**
 * POST /api/transactions
 * Admin only: Creates a new financial record.
 */
const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Validate input
    const { isValid, errors } = validateTransactionInput({ amount, type, category, date });
    if (!isValid) {
      throw new ApiError(400, errors.join(', '));
    }

    const transaction = await Transaction.create({
      amount,
      type,
      category,
      date,
      notes: notes || null,
      createdBy: req.user.id
    });

    res.status(201).json(
      new ApiResponse(201, { transaction }, 'Transaction created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions
 * All authenticated roles.
 * - Viewer: sees only their own non-deleted records
 * - Analyst/Admin: sees all non-deleted records
 * Supports filters: ?startDate, ?endDate, ?category, ?type
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, category, type } = req.query;

    // Base filter: always exclude soft-deleted records
    const where = { isDeleted: false };

    // Scope Viewer to their own records only
    if (req.user.role === ROLES.VIEWER) {
      where.createdBy = req.user.id;
    }

    // Optional filters
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json(
      new ApiResponse(200, { 
        transactions: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }, 'Transactions fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 * All authenticated roles: Returns a single non-deleted transaction.
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, isDeleted: false },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }

    res.status(200).json(
      new ApiResponse(200, { transaction }, 'Transaction fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/transactions/:id
 * Admin only: Updates a non-deleted transaction.
 */
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    // Validate input
    const { isValid, errors } = validateTransactionInput({ amount, type, category, date });
    if (!isValid) {
      throw new ApiError(400, errors.join(', '));
    }

    const transaction = await Transaction.findOne({
      where: { id, isDeleted: false }
    });

    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }

    // Update fields
    transaction.amount = amount;
    transaction.type = type;
    transaction.category = category;
    transaction.date = date;
    transaction.notes = notes || null;

    await transaction.save();

    res.status(200).json(
      new ApiResponse(200, { transaction }, 'Transaction updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/transactions/:id
 * Admin only: Soft deletes a transaction (sets isDeleted = true).
 * The record is never physically removed from the database.
 */
const softDeleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, isDeleted: false }
    });

    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }

    transaction.isDeleted = true;
    await transaction.save();

    res.status(200).json(
      new ApiResponse(200, null, 'Transaction soft-deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  softDeleteTransaction
};

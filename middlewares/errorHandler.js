const ApiError = require('../utils/ApiError');

/**
 * Global error handler middleware.
 * Must have 4 parameters (err, req, res, next) for Express to recognize it.
 *
 * - ApiError (operational): returns its statusCode + message
 * - Sequelize ValidationError: extracts field-level messages, returns 400
 * - Sequelize UniqueConstraintError: returns 409 Conflict
 * - Unknown errors: returns 500 with generic message (no stack leak in production)
 */
const errorHandler = (err, req, res, next) => {
  // Log full error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Our custom ApiError — expected, operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Sequelize validation errors (model-level validation failures)
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  // Sequelize unique constraint violation (e.g., duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      errors: messages
    });
  }

  // Unexpected errors — don't leak stack traces in production
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error'
  });
};

module.exports = errorHandler;

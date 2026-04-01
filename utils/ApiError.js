/**
 * Custom error class for operational errors.
 * Thrown in controllers/middlewares and caught by the global error handler.
 *
 * Usage: throw new ApiError(404, 'User not found');
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from bugs

    // Capture stack trace, excluding this constructor from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

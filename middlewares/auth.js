const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { USER_STATUS } = require('../config/constants');

/**
 * Authentication middleware.
 * 1. Reads JWT from the 'token' HTTP-only cookie
 * 2. Verifies and decodes the token
 * 3. Fetches the user from DB (ensures they still exist and are active)
 * 4. Attaches user to req.user for downstream use
 */
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError(401, 'Access denied. No token provided. Please login.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to ensure they still exist and check current status
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'status']
    });

    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists');
    }

    if (user.status === USER_STATUS.INACTIVE) {
      throw new ApiError(403, 'Your account has been deactivated. Contact an admin.');
    }

    // Attach user info to the request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token has expired. Please login again.'));
    }
    next(new ApiError(401, 'Authentication failed'));
  }
};

module.exports = auth;

const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware factory.
 * Returns a middleware that checks if req.user.role is in the allowed list.
 *
 * Usage in routes:
 *   router.get('/users', auth, authorize('admin'), controller);
 *   router.get('/dashboard', auth, authorize('viewer', 'analyst', 'admin'), controller);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required before authorization'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`)
      );
    }

    next();
  };
};

module.exports = authorize;

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { validateRegisterInput, validateLoginInput } = require('../utils/validators');

/**
 * Generates a JWT and sets it as an HTTP-only cookie.
 * Cookie flags: httpOnly (no JS access), secure (HTTPS only in production),
 * sameSite strict (CSRF protection).
 */
const sendTokenCookie = (user, statusCode, res, message) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10)
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json(
    new ApiResponse(statusCode, { user }, message)
  );
};

/**
 * POST /api/auth/register
 * Creates a new user and returns JWT in HTTP-only cookie.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    const { isValid, errors } = validateRegisterInput({ name, email, password, role });
    if (!isValid) {
      throw new ApiError(400, errors.join(', '));
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    // Create user (password hashed via beforeCreate hook)
    const user = await User.create({ name, email, password, role });

    sendTokenCookie(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Validates credentials and returns JWT in HTTP-only cookie.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const { isValid, errors } = validateLoginInput({ email, password });
    if (!isValid) {
      throw new ApiError(400, errors.join(', '));
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if account is active
    if (user.status === 'inactive') {
      throw new ApiError(403, 'Your account is deactivated. Contact an admin.');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    sendTokenCookie(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Clears the JWT cookie.
 */
const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0) // Expire immediately
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Logged out successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout };

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { validateRoleUpdate } = require('../utils/validators');
const { STATUS_VALUES, USER_STATUS } = require('../config/constants');

/**
 * GET /api/users
 * Admin only: Returns all users (excluding passwords via toJSON override).
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(
      new ApiResponse(200, { users, count: users.length }, 'Users fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id/role
 * Admin only: Updates a user's role.
 */
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate input
    const { isValid, errors } = validateRoleUpdate({ role });
    if (!isValid) {
      throw new ApiError(400, errors.join(', '));
    }

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      throw new ApiError(400, 'You cannot change your own role');
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.role = role;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, { user }, `User role updated to '${role}'`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/status
 * Admin only: Toggles user status between active and inactive.
 */
const toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (id === req.user.id) {
      throw new ApiError(400, 'You cannot change your own status');
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Toggle: active → inactive, inactive → active
    user.status = user.status === USER_STATUS.ACTIVE
      ? USER_STATUS.INACTIVE
      : USER_STATUS.ACTIVE;

    await user.save();

    res.status(200).json(
      new ApiResponse(200, { user }, `User status changed to '${user.status}'`)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateRole, toggleStatus };

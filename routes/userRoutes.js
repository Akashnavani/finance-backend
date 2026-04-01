const express = require('express');
const router = express.Router();
const { getAllUsers, updateRole, toggleStatus } = require('../controllers/userController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { ROLES } = require('../config/constants');

// All user management routes require auth + admin role
router.use(auth, authorize(ROLES.ADMIN));

router.get('/', getAllUsers);
router.put('/:id/role', updateRole);
router.patch('/:id/status', toggleStatus);

module.exports = router;

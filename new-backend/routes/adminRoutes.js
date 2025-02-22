const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  manageRoles
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

router.get('/stats', auth, adminCheck, getDashboardStats);
router.patch('/users/:id/role', auth, adminCheck, manageRoles);

module.exports = router;
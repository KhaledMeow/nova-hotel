const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

router.get('/me', auth, getUserProfile);
router.put('/me', auth, updateProfile);
router.get('/', auth, adminCheck, getAllUsers);
router.delete('/:id', auth, adminCheck, deleteUser);

module.exports = router;
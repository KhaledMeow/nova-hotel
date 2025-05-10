const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getAllUsers,
  addUser,
  editUser,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const dotenv = require('dotenv');
dotenv.config();

router.get('/me', auth, getUserProfile);
router.get('/', auth, adminCheck, getAllUsers);
router.post('/', auth, adminCheck, addUser);
router.patch('/:id', auth, adminCheck, editUser);
router.delete('/:id', auth, adminCheck, deleteUser);

module.exports = router;
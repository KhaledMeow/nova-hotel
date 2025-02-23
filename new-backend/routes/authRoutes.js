const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getCurrentUser
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getCurrentUser);


module.exports = router;
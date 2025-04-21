const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();
const {
  login,
  register,
  logout,
  getCurrentUser
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  message: 'Too many login attempts, please try again later'
});
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', auth, getCurrentUser);


module.exports = router;
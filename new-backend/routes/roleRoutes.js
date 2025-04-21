const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const {
  getAllRoles,
  createRole
} = require('../controllers/roleController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

router.get('/', auth, adminCheck, getAllRoles);
router.post('/', auth, adminCheck, createRole);

module.exports = router;
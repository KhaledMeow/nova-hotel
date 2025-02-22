const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  resolveComplaint
} = require('../controllers/complaintController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

router.post('/', auth, createComplaint);
router.get('/', auth, adminCheck, getComplaints);
router.patch('/:id/resolve', auth, adminCheck, resolveComplaint);

module.exports = router;
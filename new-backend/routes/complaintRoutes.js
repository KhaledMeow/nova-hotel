const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  resolveComplaint
} = require('../controllers/complaintController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const rateLimit = require('express-rate-limit');

const complaintLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});

router.post('/', complaintLimiter, auth, createComplaint);
router.get('/', auth, adminCheck, getComplaints);
router.patch('/:id/resolve', auth, adminCheck, resolveComplaint);

module.exports = router;
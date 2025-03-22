const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
  inProgressComplaint,
  solveComplaint

} = require('../controllers/complaintController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const rateLimit = require('express-rate-limit');

const complaintLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});

router.post('/', complaintLimiter, auth, createComplaint);
router.get('/', auth, getUserComplaints);
router.patch('/:id/in-progress', auth, inProgressComplaint);
router.patch('/:id/solve', auth, solveComplaint);

module.exports = router;
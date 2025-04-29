const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const {
  createComplaint,
  getUserComplaints,
  inProgressComplaint,
  solveComplaint,
  getAllComplaints

} = require('../controllers/complaintController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');


router.post('/', auth, createComplaint);
// Admin/Staff: get all complaints (filtered by user if not admin/staff)
router.get('/', auth, adminCheck, getUserComplaints);
// Guest: get only their own complaints
router.get('/my', auth, getUserComplaints);
router.patch('/:id/in-progress', auth, adminCheck,  inProgressComplaint);
router.patch('/:id/solve', auth, adminCheck, solveComplaint);
router.get('/all', auth, adminCheck, getAllComplaints);

module.exports = router;
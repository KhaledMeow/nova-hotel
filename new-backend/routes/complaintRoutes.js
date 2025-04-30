const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const {
  createComplaint,
  getUserComplaints,
  inProgressComplaint,
  solveComplaint,
  getAllComplaints,
  deleteComplaint

} = require('../controllers/complaintController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');


router.post('/', auth, createComplaint);
router.get('/', auth, adminCheck, getUserComplaints);
router.get('/my', auth, getUserComplaints);
router.patch('/:id/in-progress', auth, adminCheck,  inProgressComplaint);
router.patch('/:id/solve', auth, adminCheck, solveComplaint);
router.delete('/:id', auth, adminCheck, deleteComplaint);
router.get('/all', auth, adminCheck, getAllComplaints);

module.exports = router;
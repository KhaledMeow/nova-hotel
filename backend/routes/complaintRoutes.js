const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.post('/complaints', complaintController.handleComplaint);

router.get('/complaints', complaintController.getComplaints);

module.exports = router;

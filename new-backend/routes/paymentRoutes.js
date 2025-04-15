const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentDetails,
  completePayment,
  refundPayment,
  getAllPayments,
  getUserPayments
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

router.post('/', auth, createPayment);
router.get('/:id', auth, getPaymentDetails);
router.patch('/:id/complete', auth, completePayment);
router.patch('/:id/refund', auth, refundPayment);
router.get('/', auth, getUserPayments);
router.get('/all', auth, getAllPayments);

module.exports = router;
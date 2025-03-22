const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentDetails,
  completePayment,
  refundPayment,
  getUserPayments
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/', auth, createPayment);
router.get('/:id', auth, getPaymentDetails);
router.patch('/:id/complete', auth, completePayment);
router.patch('/:id/refund', auth, refundPayment);
router.get('/', auth, getUserPayments);

module.exports = router;
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const {
  createPayment,
  getPaymentDetails,
  completePayment,
  refundPayment,
  getAllPayments,
  getUserPayments,
  deletePayment
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

router.post('/', auth, createPayment);

router.get('/my', auth, getUserPayments);
router.delete('/:id', auth, adminCheck, deletePayment);
router.get('/:id', auth, getPaymentDetails);
router.patch('/:id/complete', auth, adminCheck, completePayment);
router.patch('/:id/refund', auth, adminCheck, refundPayment);
router.get('/', auth, adminCheck, getAllPayments);

module.exports = router;
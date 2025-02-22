const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentDetails,
  handlePaymentWebhook
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/', auth, createPayment);
router.get('/:id', auth, getPaymentDetails);
router.post('/webhook', handlePaymentWebhook);

module.exports = router;
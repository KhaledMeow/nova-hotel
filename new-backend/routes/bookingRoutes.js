const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  cancelBooking
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getUserBookings);
router.patch('/:id/cancel', auth, cancelBooking);

module.exports = router;
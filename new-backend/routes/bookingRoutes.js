const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const { body } = require('express-validator');
const adminCheck = require('../middleware/adminCheck');
const dotenv = require('dotenv');
dotenv.config();

const validateBooking = async (req, res, next) => {
  try {
    const { room, check_in_date, check_out_date } = req.body;

    if (!room || !check_in_date || !check_out_date) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (!roomDoc.booked_dates) {
      roomDoc.booked_dates = [];
    }

    const isAvailable = roomDoc.booked_dates.every(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      return checkOut <= bookingStart || checkIn >= bookingEnd;
    });

    if (!isAvailable) {
      return res.status(409).json({ error: 'Room not available for selected dates' });
    }

    req.room = roomDoc;
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
router.post('/', [ 
  body('check_in_date').isISO8601(),
  body('check_out_date').isISO8601(),
  body('num_of_people').isInt({ min: 1, max: 6 }),
  body('room').isMongoId()
], auth, validateBooking, bookingController.createBooking);

router.get('/', auth, adminCheck, bookingController.getUserBookings);
router.get('/my', auth, bookingController.getUserBookings);
router.patch('/:id/', auth, adminCheck, bookingController.cancelBooking);
router.delete('/:id', auth, adminCheck, bookingController.deleteBooking);
router.patch('/:id/confirm', auth, adminCheck, bookingController.confirmBooking);
router.get('/all', auth, adminCheck, bookingController.getAllBookings);

module.exports = router;
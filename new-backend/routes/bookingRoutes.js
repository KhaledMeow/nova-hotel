const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const Room = require('../models/Room');


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
router.post('/', auth, validateBooking, bookingController.createBooking);

router.get('/', auth, bookingController.getUserBookings);

router.patch('/:id', auth, bookingController.cancelBooking);

module.exports = router;
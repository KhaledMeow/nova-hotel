const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const Room = require('../models/Room');

// Middleware to validate booking dates and availability
const validateBooking = async (req, res, next) => {
  try {
    const { room, check_in_date, check_out_date } = req.body;
    
    // Validate required fields
    if (!room || !check_in_date || !check_out_date) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Convert to Date objects
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    
    // Date validation
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Find the room
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check availability
    const isAvailable = room.booked_dates.every(booking => {
      return checkOut <= booking.startDate || checkIn >= booking.endDate;
    });

    if (!isAvailable) {
      return res.status(409).json({ error: 'Room not available for selected dates' });
    }

    // Attach room data to request for controller
    req.room = room;
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Updated routes
router.post('/', 
  auth,
  validateBooking, // Add validation middleware
  bookingController.createBooking
);

router.get('/', auth, bookingController.getUserBookings);
router.patch('/:id', auth, bookingController.cancelBooking);

module.exports = router;
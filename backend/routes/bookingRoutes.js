const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/bookings', bookingController.handleBooking);

router.get('/bookings', (req, res) => {
    res.status(200).json({
        message: "Bookings retrieved successfully",
        data: bookings
    });
});

router.get('/retrieve-bookings', (req, res) => {
    res.status(200).json({
        message: "Bookings retrieved successfully",
        data: bookings
    });
});

module.exports = router;

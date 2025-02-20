const express = require('express');
const Room = require('../models/roomModel'); // Ensure this path is correct
const router = express.Router();

// Get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new booking
router.post('/bookings', async (req, res) => {
    const booking = new Booking({
        name: req.body.name,
        email: req.body.email,
        room: req.body.room,
        checkInDate: req.body.checkInDate,
        checkOutDate: req.body.checkOutDate
    });
    try {
        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

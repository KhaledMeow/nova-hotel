const express = require('express');
const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel'); // Ensure this path is correct
const router = express.Router();

// Get all rooms
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new booking
router.post('/bookings', async (req, res) => {
    try {
        const { name, phone, email, special_requests, room_type, check_in_date, check_out_date, num_of_people } = req.body;

        // Validate room availability
        const room = await Room.findOne({ type: room_type, isAvailable: true });
        if (!room) {
            return res.status(400).json({ message: 'Room not available' });
        }

        // Create the booking
        const booking = new Booking({
            name,
            phone,
            email,
            special_requests,
            room_type,
            check_in_date: new Date(check_in_date),
            check_out_date: new Date(check_out_date),
            num_of_people,
        });

        // Save the booking
        await booking.save();

        // Update room availability
        room.isAvailable = false;
        await room.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update room availability
router.patch('/rooms/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        room.isAvailable = req.body.isAvailable;
        await room.save();
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
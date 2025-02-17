const Booking = require('../models/bookingModel');

// Handle booking logic here
exports.handleBooking = (req, res) => {
    const bookingData = req.body;
    const errors = {};

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'check_in_date', 'check_out_date', 'num_of_people'];
    requiredFields.forEach(field => {
        if (!bookingData[field] || (typeof bookingData[field] === 'string' && bookingData[field].trim() === '')) {
            errors[field] = `${field.replace('_', ' ').toUpperCase()} is required`;
        }
    });

    // Email validation
    if (bookingData.email && !/^\S+@\S+\.\S+$/.test(bookingData.email)) {
        errors.email = 'Invalid email address';
    }

    // Number of people validation
    if (bookingData.num_of_people && parseInt(bookingData.num_of_people, 10) < 1) {
        errors.num_of_people = 'Number of people must be at least 1';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    // Generate a unique booking ID
    const bookingId = `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create a complete, sanitized booking entry
    const bookingEntry = {
        id: bookingId,
        name: bookingData.name.trim(),
        email: bookingData.email.trim(),
        phone: bookingData.phone.trim(),
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        num_of_people: parseInt(bookingData.num_of_people, 10),
        room_type: bookingData.room_type || 'Standard',
        special_requests: bookingData.special_requests || '',
        paymentIntentId: bookingData.paymentIntentId,
        timestamp: new Date().toISOString()
    };

    // Add the booking to the bookings array
    Booking.create(bookingEntry, (err, booking) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to create booking' });
        }

        console.log("Booking saved successfully:", booking);

        // Respond with success message and booking details
        res.status(201).json({
            message: "Booking successfully created",
            bookingId: bookingId,
            booking: bookingEntry
        });
    });
};

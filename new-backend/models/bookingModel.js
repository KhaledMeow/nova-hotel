const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    special_requests: { type: String, default: '' },
    room_type: { type: String, required: true },
    check_in_date: { type: Date, required: true },
    check_out_date: { type: Date, required: true },
    num_of_people: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, { collection: 'bookings' });

module.exports = mongoose.model('Booking', bookingSchema);
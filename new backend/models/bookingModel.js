const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    check_in_date: { type: Date, required: true },
    check_out_date: { type: Date, required: true },
    num_of_people: { type: Number, required: true },
    room_type: { type: String, default: 'Standard' },
    special_requests: { type: String, default: '' },
    paymentIntentId: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);

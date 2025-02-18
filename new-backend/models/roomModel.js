const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomType: { type: String, required: true },
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
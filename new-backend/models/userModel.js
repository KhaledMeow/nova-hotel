const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'guest'], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required']
  },
  check_in_date: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  check_out_date: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  num_guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest required']
  },
  special_requests: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
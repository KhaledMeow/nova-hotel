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
  check_in_date: Date,
  check_out_date: Date,
  num_guests: Number,
  special_requests: String,

  
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_number: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: [
      'One Bedded Room',
      'Deluxe Suite',
      'Family Room',
      'Penthouse Suite',
      'VIP Offers',
      'Weekend Getaway Package',
      'Romantic Escape'
    ]
  },
  amenities: {
    type: [String],
    required: [true, 'Amenities are required']
  },
  image: {
    type: String,
    required: [true, 'Image path is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  booked_dates: [{
    start: Date,
    end: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
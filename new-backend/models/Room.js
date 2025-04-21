const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

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
  booked_dates: {
    type: [{
      startDate: {
        type: Date,
        required: true,
        validate: {
          validator: function(v) {
            return v < this.endDate;
          },
          message: 'Start date must be before end date'
        },
        set: function(v) {
          return new Date(v).setUTCHours(23,59,59,999);
        }
      },
      endDate: {
        type: Date,
        required: true,
        validate: {
          validator: function(v) {
            return v > this.startDate;
          },
          message: 'End date must be after start date'
        }
      }
    }],
    validate: {
      validator: function(bookings) {
        return bookings.every((booking, index) => 
          bookings.slice(index + 1).every(other => 
            booking.endDate <= other.startDate || 
            booking.startDate >= other.endDate
          )
        );
      },
      message: 'Booking dates cannot overlap'
    }
  }
}, {
  validationLevel: 'strict',
  validationAction: 'error'
})


roomSchema.index({ 
  'booked_dates.startDate': 1,
  'booked_dates.endDate': 1,
  type: 1
});

roomSchema.index({
  name: 'text',
  description: 'text',
  amenities: 'text'
});


module.exports = mongoose.model('Room', roomSchema);
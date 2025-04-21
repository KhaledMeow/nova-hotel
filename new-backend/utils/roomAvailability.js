const Room = require('../models/Room');
const dotenv = require('dotenv');
dotenv.config();

exports.checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  try {
    const room = await Room.findOne({
      _id: roomId,
      booked_dates: {
        $not: {
          $elemMatch: {
            startDate: { $lt: new Date(checkOut) },
            endDate: { $gt: new Date(checkIn) }
          }
        }
      }
    });
    
    return !!room;
  } catch (error) {
    console.error('Availability check error:', error);
    return false;
  }
};
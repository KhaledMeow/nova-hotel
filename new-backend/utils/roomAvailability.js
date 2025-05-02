const Room = require('../models/Room');
const dotenv = require('dotenv');
dotenv.config();

exports.checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  try {
    // Convert dates to start of day in UTC to avoid time zone issues
    const startOfDay = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const checkInDate = startOfDay(new Date(checkIn));
    const checkOutDate = startOfDay(new Date(checkOut));

    const room = await Room.findOne({
      _id: roomId,
      booked_dates: {
        $not: {
          $elemMatch: {
            startDate: { $lt: checkOutDate },
            endDate: { $gt: checkInDate }
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
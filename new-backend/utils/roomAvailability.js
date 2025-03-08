const Room = require('../models/Room');

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
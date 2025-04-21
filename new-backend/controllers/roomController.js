const Room = require('../models/Room');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().select('-booked_dates');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoomAvailability = async (req, res) => {
  try {
    const { month, year } = req.query;
    

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const rooms = await Room.find().lean();

    const availability = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const availableRooms = rooms.filter(room => 
        !room.booked_dates.some(booking => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          return currentDate >= bookingStart && currentDate <= bookingEnd;
        })
      );
      
      availability[dateStr] = {
        available: availableRooms.length > 0,
        count: availableRooms.length
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
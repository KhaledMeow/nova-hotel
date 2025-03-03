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
    const { startDate, endDate } = req.query;
    
    const rooms = await Room.find({
      booked_dates: {
        $not: {
          $elemMatch: {
            startDate: { $lt: new Date(endDate) },
            endDate: { $gt: new Date(startDate) }
          }
        }
      }
    });
    
    res.json({ availableRooms: rooms.length, rooms });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
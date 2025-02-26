const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { room, check_in_date, check_out_date, num_guests } = req.body;
    const startDate = new Date(check_in_date);
    const endDate = new Date(check_out_date);

    // Validate date objects
    if (isNaN(startDate)) throw new Error('Invalid check-in date');
    if (isNaN(endDate)) throw new Error('Invalid check-out date');

    const roomData = await Room.findById(ObjectId(room)).session(session);
    const isAvailable = roomData.booked_dates.every(booking => 
      endDate <= booking.startDate || 
      startDate >= booking.endDate
    );

    if (!isAvailable) throw new Error('Room not available');

    const [booking] = await Booking.create([{
      user: req.user._id,
      room,
      check_in_date: startDate,
      check_out_date: endDate,
      num_guests,
      status: 'confirmed'
    }], { session });

    await Room.findByIdAndUpdate(
      ObjectId(room),
      { $push: { booked_dates: { startDate, endDate } } },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(booking);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } finally {
    session.endSession();
  }
};
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'roomType price');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Update booking status
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, session }
    );

    // 2. Remove from room bookings
    await Room.findByIdAndUpdate(
      ObjectId(booking.room),
      { $pull: { booked_dates: { 
        startDate: Date,
        endDate: Date
      }}},
      { session }
    );

    await session.commitTransaction();
    res.json(booking);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
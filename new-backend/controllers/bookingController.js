const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, check_in_date, check_out_date, num_guests } = req.body;

    if (!roomId || !check_in_date || !check_out_date || !num_guests) {
      throw new Error('Missing required booking fields');
    }

    // 1. Check room availability
    const room = await Room.findById(roomId).session(session);
    const isAvailable = !room.bookedDates.some(booking => 
      new Date(check_out_date) > booking.startDate && 
      new Date(check_in_date) < booking.endDate
    );

    if (!isAvailable) throw new Error('Room not available');

    // 2. Create booking
    const booking = await Booking.create([{
      user: req.user.userId,
      room: roomId,
      check_in_date,
      check_out_date,
      status: 'confirmed'
    }], { session });

    // 3. Update room
    room.bookedDates.push({ 
      startDate: check_in_date, 
      endDate: check_out_date 
    });
    await room.save({ session });

    await session.commitTransaction();
    res.status(201).json(booking[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
     });
  } finally {
    session.endSession();
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
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
      booking.room,
      { $pull: { bookedDates: { 
        startDate: booking.check_in_date,
        endDate: booking.check_out_date
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
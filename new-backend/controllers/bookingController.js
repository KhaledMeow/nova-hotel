const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const roomDoc = req.room;
    const { check_in_date, check_out_date, num_guests } = req.body;
    
    const startDate = new Date(check_in_date);
    const endDate = new Date(check_out_date);

    // Validate dates
    if (isNaN(startDate.getTime())) throw new Error('Invalid check-in date');
    if (isNaN(endDate.getTime())) throw new Error('Invalid check-out date');

    // Ensure booked_dates exists
    if (!roomDoc.booked_dates) {
      roomDoc.booked_dates = [];
      await roomDoc.save({ session });
    }

    const isAvailable = roomDoc.booked_dates.every(booking => 
      endDate <= booking.startDate || 
      startDate >= booking.endDate
    );

    if (!isAvailable) throw new Error('Room not available');

    const booking = await Booking.create([{
      user: req.user._id,
      room: roomDoc._id,
      check_in_date: startDate,
      check_out_date: endDate,
      num_guests,
      status: 'confirmed'
    }], { session });

    await Room.findByIdAndUpdate(
      roomDoc._id,
      { $push: { 
        booked_dates: {
          startDate: startDate,
          endDate: endDate
        }
      }},
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      ...booking[0].toObject(),
      message: "Booking successfully created"
    });
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
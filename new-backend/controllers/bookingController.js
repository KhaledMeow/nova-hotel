const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { checkRoomAvailability } = require('../utils/roomAvailability');

exports.createBooking = async (req, res) => {
  try {
    const room = req.room;
    const { check_in_date, check_out_date, num_guests } = req.body;

    // Remove transaction code
    const checkIn = new Date(req.body.check_in_date + "T00:00:00Z");
    const checkOut = new Date(req.body.check_out_date + "T23:59:59Z");
    
    // Add manual availability check
    const conflictingBooking = await Room.findOne({
      _id: room._id,
      'booked_dates.startDate': { $lt: checkOut },
      'booked_dates.endDate': { $gt: checkIn }
    });

    if (conflictingBooking) {
      throw new Error('Room not available');
    }

    // Continue with booking creation
    const updatedRoom = await Room.findByIdAndUpdate(
      room._id,
      { $push: { booked_dates: { startDate: checkIn, endDate: checkOut } } },
      { new: true }
    );

    if (!updatedRoom) throw new Error("Failed to update room availability");

    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      check_in_date: checkIn,
      check_out_date: checkOut,
      num_guests,
      status: 'confirmed'
    });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.check_in_date)) {
      throw new Error('Invalid check-in date format');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.check_out_date)) {
      throw new Error('Invalid check-out date format');
    }
    res.status(201).json({ ...booking.toObject(), message: "Booking created" });

  } catch (error) {
    res.status(400).json({ error: error.message });
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
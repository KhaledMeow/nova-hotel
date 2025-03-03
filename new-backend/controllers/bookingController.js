const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');

exports.createBooking = async (req, res) => {
  try {
    const roomDoc = req.room;
    const { check_in_date, check_out_date, num_guests } = req.body;
    
    // 1. Update room availability FIRST
    const updatedRoom = await Room.findByIdAndUpdate(
      roomDoc._id,
      { 
        $push: { 
          booked_dates: {
            startDate: new Date(check_in_date),
            endDate: new Date(check_out_date)
          }
        }
      },
      { new: true }
    );
    // In bookingController.js
    const checkIn = new Date(req.body.check_in_date + "T00:00:00Z"); // UTC
    const checkOut = new Date(req.body.check_out_date + "T23:59:59Z");
    if (!updatedRoom) throw new Error("Failed to update room availability");

    // 2. Create booking AFTER successful room update
    const booking = await Booking.create({
      user: req.user._id,
      room: roomDoc._id,
      check_in_date: new Date(check_in_date),
      check_out_date: new Date(check_out_date),
      num_guests,
      status: 'confirmed'
    });

    res.status(201).json({
      ...booking.toObject(),
      message: "Booking successfully created"
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
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
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, checkInDate, checkOutDate, numGuests } = req.body;
    const userId = req.user._id;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) throw new Error('Invalid date range');
    
    // Add manual availability check
    const conflictingBooking = await Room.findOne({
      _id: roomId,
      'booked_dates.startDate': { $lt: checkOut },
      'booked_dates.endDate': { $gt: checkIn }
    });
    // Check availability
    const room = await Room.findOne({
      _id: roomId,
      booked_dates: {
        $not: {
          $elemMatch: {
            startDate: { $lt: checkOut },
            endDate: { $gt: checkIn }
          }
        }
      }
    }).session(session);

    if (!room) throw new Error('Room not available for selected dates');

    const booking = await Booking.create([{
      user: userId,
      room: roomId,
      check_in_date: checkIn,
      check_out_date: checkOut,
      num_guests: numGuests,
      status: 'confirmed'
    }], { session });

    await Room.findByIdAndUpdate(
      roomId,
      {
        $push: {
          booked_dates: {
            startDate: checkIn,
            endDate: checkOut
          }
        }
      },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ ...booking.toObject(), message: "Booking created" });

  } catch (error) {
    await session.abortTransaction();
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
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) throw new Error('Booking not found');

    // Remove from room bookings
    await Room.findByIdAndUpdate(
      booking.room,
      {
        $pull: {
          booked_dates: {
            startDate: booking.check_in_date,
            endDate: booking.check_out_date
          }
        }
      },
      { session }
    );

    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });

    await session.commitTransaction();
    res.json(booking);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
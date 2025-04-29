const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { checkRoomAvailability } = require('../utils/roomAvailability');

exports.createBooking = async (req, res) => {
  try {
    const { room: roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');
  
    const checkIn = new Date(req.body.check_in_date);
    const checkOut = new Date(req.body.check_out_date);
    
    const { num_guests } = req.body;

    if (!(checkIn instanceof Date && !isNaN(checkIn)) || 
        !(checkOut instanceof Date && !isNaN(checkOut))) {
      throw new Error('Invalid date values received');
    }

    const conflictingBooking = await Room.findOne({
      _id: room._id,
      'booked_dates.startDate': { $lt: checkOut },
      'booked_dates.endDate': { $gt: checkIn }
    });
    if (isNaN(checkIn) || isNaN(checkOut)) {
      throw new Error('Invalid date format');
    }
    if (conflictingBooking) {
      throw new Error('Room not available');
    }

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
      status: 'pending'
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
  // Guests: see only their own bookings; admin/staff: see all
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
    ? {} // admin/staff see all
    : { user: req.user._id }; // guest sees only their own
  try {
    const bookings = await Booking.find(filter)
      .populate('room', 'name type price')
      .populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff') 
  ? {} 
  : { user: req.user._id };
  try {
    const bookings = await Booking.find(filter)
      .populate('room', 'name type price')
      .populate('user', 'name email');
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const booking = await Booking.findById(req.params.id, filter)
    if (!booking) throw new Error('Booking not found');

    if (booking.status === 'cancelled')
      return res.status(400).json({
        success: false,
        error: 'Booking already cancelled'
      });

    const roomUpdate = await Room.findByIdAndUpdate(
      booking.room,
      { $pull: { 
        booked_dates: { 
          startDate: new Date(booking.check_in_date),
          endDate: new Date(booking.check_out_date)
        }
      }},
      { new: true }
    );

    if (!roomUpdate) throw new Error('Failed to update room availability');


    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    res.json({
      ...updatedBooking.toObject(),
      room: roomUpdate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
exports.confirmBooking = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const booking = await Booking.findById(req.params.id, filter);
    if (!booking) throw new Error('Booking not found');

    if (booking.status === 'confirmed') {
      return res.status(400).json({ 
        success: false,
        error: 'Booking already confirmed' 
      });
    }

    const isAvailable = await checkRoomAvailability(
      booking.room,
      booking.check_in_date,
      booking.check_out_date
    );

    if (!isAvailable) {
      throw new Error('Room no longer available for these dates');
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
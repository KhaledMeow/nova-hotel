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
    
    const { num_of_people } = req.body;

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

    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      check_in_date: checkIn,
      check_out_date: checkOut,
      num_of_people,
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
// for cancel booking and delete booking
function getNormalizedBookingDates(checkInRaw, checkOutRaw) {
  const checkIn = new Date(checkInRaw);
  const checkOut = new Date(checkOutRaw);
  const startNight = new Date(checkIn);
  const endNight = new Date(checkOut);
  endNight.setDate(endNight.getDate() - 1);
  startNight.setDate(startNight.getDate() - 2);
  startNight.setUTCHours(0,0,0,0);
  endNight.setUTCHours(0,0,0,0);
  return { startNight, endNight };
}

exports.cancelBooking = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const booking = await Booking.findOne({ _id: req.params.id, ...filter });
    if (!booking) throw new Error('Booking not found');

    if (booking.status === 'cancelled')
      return res.status(400).json({
        success: false,
        error: 'Booking already cancelled'
      });

    const { startNight, endNight } = getNormalizedBookingDates(booking.check_in_date, booking.check_out_date);
    const roomUpdate = await Room.findByIdAndUpdate(
      booking.room,
      { $pull: { 
        booked_dates: { 
          startDate: startNight,
          endDate: endNight
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
exports.deleteBooking = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
    ? {}
    : { user: req.user._id };
  try {
    const booking = await Booking.findOne({ _id: req.params.id, ...filter });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const { startNight, endNight } = getNormalizedBookingDates(booking.check_in_date, booking.check_out_date);
    await Room.findByIdAndUpdate(
      booking.room,
      { $pull: {
        booked_dates: {
          startDate: startNight,
          endDate: endNight
        }
      } }
    );
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.confirmBooking = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const booking = await Booking.findOne({ _id: req.params.id, ...filter });
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

    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const startNight = new Date(checkIn);
    const endNight = new Date(checkOut);
    endNight.setDate(endNight.getDate() - 1);
    startNight.setDate(startNight.getDate() - 2);
    startNight.setUTCHours(0,0,0,0);
    endNight.setUTCHours(0,0,0,0);
    if (startNight <= endNight) {
      await Room.findByIdAndUpdate(
        booking.room,
        { $push: { booked_dates: { startDate: startNight, endDate: endNight } } }
      );
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
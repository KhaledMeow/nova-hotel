const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.createPayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body;
    
    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('room', 'price')
      .populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const amount = nights * booking.room.price;
    
    const payment = await Payment.create({
      booking: bookingId,
      user: booking.user._id,
      amount,
      method,
      status: 'pending'
    });
    // Update booking status
    await Booking.findByIdAndUpdate(bookingId, { status: 'pending' });
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getUserPayments = async (req, res) => {
  const filter = (req.user.role === 'guest')
  ? {}
  : {user: req.user._id};
  try {
    const payments = await Payment.find(filter)
      .populate('booking', 'check_in_date check_out_date')
      .populate('user', 'name email');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completePayment = async (req, res) => {
  const filter = (req.user.role === 'admin' || req.user.role === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const payment = await Payment.findById(req.params.id, filter);
    if (!payment) throw new Error('Payment not found');

    if (payment.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        error: 'Payment already completed' 
      });
    }

    // Update payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  const filter = (req.user.role === 'admin' || req.user.role === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'check_in_date check_out_date')
      .populate('user', 'name');
      
    res.json(payment);
  } catch (error) {
    res.status(404).json({ error: 'Payment not found' });
  }
};

exports.refundPayment = async (req, res) => {
  const filter = (req.user.role === 'admin' || req.user.role === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const payment = await Payment.findById(req.params.id, filter);
    if (!payment) throw new Error('Payment not found');

    if (payment.status === 'refunded') {
      return res.status(400).json({ 
        success: false,
        error: 'Payment already refunded' 
      });
    }

    // Update payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'refunded' },
      { new: true }
      );

    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
exports.getAllPayments = async (req, res) => {
  const filter = (req.user.role === 'admin' || req.user.role === 'staff') 
  ? {} 
  : { user: req.user._id };
  try {
    const payments = await Payment.find(filter)
      .populate('booking', 'check_in_date check_out_date')
      .populate('user', 'name email');
      
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
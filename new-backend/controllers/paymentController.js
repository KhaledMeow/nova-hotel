const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.createPayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body;
    
    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('room', 'price_per_night');
    
    // Calculate total amount
    const nights = Math.ceil(
      (booking.check_out_date - booking.check_in_date) / (1000 * 60 * 60 * 24)
    );
    const amount = nights * booking.room.price_per_night;

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: req.body.amount,
      method: req.body.method,
    });

    // Update booking status
    await Booking.findByIdAndUpdate(req.body.bookingId, { status: 'confirmed' });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'check_in_date check_out_date')
      .populate('user', 'first_name last_name');
      
    res.json(payment);
  } catch (error) {
    res.status(404).json({ error: 'Payment not found' });
  }
};

// For future payment gateway integration
exports.handlePaymentWebhook = async (req, res) => {
  // Implementation for Stripe/PayPal webhooks
  res.status(200).json({ received: true });
};
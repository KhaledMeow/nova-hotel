const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res) => {
  try {
    const [users, bookings, payments] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Payment.countDocuments()
    ]);

    res.json({ users, bookings, payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manageRoles = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
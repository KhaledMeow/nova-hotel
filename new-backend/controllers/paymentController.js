const express = require('express');
const Payment = require('../models/paymentModel'); // Ensure this path is correct
const router = express.Router();

// Process a payment
router.post('/payments', async (req, res) => {
    const payment = new Payment({
        amount: req.body.amount,
        method: req.body.method,
        bookingId: req.body.bookingId
    });
    try {
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

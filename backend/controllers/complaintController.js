const Complaint = require('../models/complaintModel');

// Handle complaints logic here
exports.handleComplaint = (req, res) => {
    const { name, email, message } = req.body;
    const errors = {};

    if (!name || name.trim() === '') {
        errors.name = 'Name is required';
    }

    if (!email || email.trim() === '') {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Invalid email address';
    }

    if (!message || message.trim() === '') {
        errors.message = 'Message is required';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const complaint = {
        id: complaintCounter.toString(),
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: new Date()
    };

    complaints.push(complaint);
    complaintCounter++;

    res.status(201).json({
        message: "Complaint submitted successfully",
        data: complaint
    });
};

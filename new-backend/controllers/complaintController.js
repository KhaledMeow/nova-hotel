const express = require('express');
const Complaint = require('../models/complaintModel'); // Ensure this path is correct
const router = express.Router();

// Get all complaints
router.get('/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new complaint
router.post('/complaints', async (req, res) => {
    const complaint = new Complaint({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
    });
    try {
        const savedComplaint = await complaint.save();
        res.status(201).json(savedComplaint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

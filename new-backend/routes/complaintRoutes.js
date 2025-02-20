const express = require('express');
const Complaint = require('../models/complaintModel'); 
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
router.post('/', async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error("Error saving complaint:", error);
    res.status(500).json({ message: "Failed to save complaint" });
  }
});

module.exports = router;

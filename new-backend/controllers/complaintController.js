const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      user: req.user._id,
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    });

    res.status(201).json(complaint);
  } catch (error) {
    let errors = {};
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }

    // Handle other errors
    const response = {
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        fullError: error 
      })
    };
    
    res.status(400).json(response);
  }
};
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'username');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
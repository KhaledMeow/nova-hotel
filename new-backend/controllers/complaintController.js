const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the incoming request body
    const complaint = await Complaint.create({
      user: req.user._id,  // Ensure authentication middleware is working
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    });
    console.log('Created Complaint:', complaint); // Log the created complaint
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Validation Error:', error); // Log the error details
    console.error('Validation Error Message:', error.message); // Log the error message
    if (error.name === 'ValidationError') {
      const validationErrorDetails = Object.keys(error.errors).map(key => {
        return {
          field: key,
          message: error.errors[key].message,
          kind: error.errors[key].kind,
          path: error.errors[key].path,
          value: error.errors[key].value
        };
      });
      console.error('Validation Error Details:', validationErrorDetails); // Log the validation error details
    } else {
      console.error('Error Details:', error); // Log the error details
    }
    
    // Enhanced validation error handling
    if (error.name === 'ValidationError') {
      const errors = Object.entries(error.errors).reduce((acc, [key, val]) => {
        acc[key] = val.message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }
    
    // Consistent error format
    res.status(400).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
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
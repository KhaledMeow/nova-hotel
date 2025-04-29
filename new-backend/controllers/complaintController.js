const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try {
    console.log('Request Body:', req.body); 
    const complaint = await Complaint.create({
      user: req.user._id,
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      category: req.body.category 
    });
    console.log('Created Complaint:', complaint); 
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Validation Error:', error); 
    console.error('Validation Error Message:', error.message); 
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
      console.error('Validation Error Details:', validationErrorDetails); 
    } else {
      console.error('Error Details:', error); 
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.entries(error.errors).reduce((acc, [key, val]) => {
        acc[key] = val.message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }
    
    res.status(400).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

exports.getUserComplaints = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
    ? {}
    : { user: req.user._id };

  try {
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'email name');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.solveComplaint = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Complaint ID is required' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: id, ...filter },
      { status: 'solved' },
      { new: true }
    );
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.inProgressComplaint = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff')
  ? {}
  : {user: req.user._id};
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Complaint ID is required' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: id, ...filter },
      { status: 'in progress' },
      { new: true }
    );
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getAllComplaints = async (req, res) => {
  const filter = (req.user.roleName === 'admin' || req.user.roleName === 'staff') 
  ? {} 
  : { user: req.user._id };
  try {
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
      
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
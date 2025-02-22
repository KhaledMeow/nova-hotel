const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authorization required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with valid token
    const user = await User.findOne({
      _id: decoded.userId,
      tokens: token
    });

    if (!user) throw new Error('Invalid token');

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Authentication required',
      systemMessage: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
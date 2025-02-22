const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // 1. Check for Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Authorization token required');
    }

    // 2. Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user with valid token
    const user = await User.findOne({
      _id: decoded.userId,
      'tokens.token': token
    }).select('+tokens');

    if (!user) throw new Error('Authentication failed');

    // 4. Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: error.message
    });
  }
};
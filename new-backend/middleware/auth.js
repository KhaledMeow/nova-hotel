const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const dotenv = require('dotenv');
dotenv.config();

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authorization required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      _id: decoded.userId,
      tokens: token
    });

    if (!user) throw new Error('Invalid token');

    req.user = user;
    req.token = token;

    if (user.role) {
      const roleDoc = await Role.findById(user.role);
      req.user.roleName = roleDoc ? roleDoc.name : undefined;
    } else {
      req.user.roleName = undefined;
    }
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Need to login first',
      systemMessage: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
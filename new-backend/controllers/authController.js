const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Add validation for required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Auto-create guest role if missing
    let defaultRole = await Role.findOne({ name: 'guest' });
    if (!defaultRole) {
      defaultRole = await Role.create({
        name: 'guest',
        permissions: ['create_booking']
      });
    }

    // Let Mongoose handle password hashing
    const user = await User.create({
      email,
      password, // Plain text - will be hashed by pre-save hook
      first_name,
      last_name,
      phone,
      role: defaultRole._id
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    user.tokens.push(token);
    await user.save();

    res.status(201).json({
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(400).json({
      error: 'Registration failed',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with tokens
    const user = await User.findOne({ email }).select('+password +tokens');
    if (!user) throw new Error('Invalid credentials');

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    // Generate and store new token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    user.tokens.push(token);
    await user.save();

    res.json({ 
      user: user.toJSON(),
      token 
    });

  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Remove token from user's tokens array
    const user = await User.findById(req.user.id);
    user.tokens = user.tokens.filter(t => t !== req.token);
    await user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by your auth middleware
    const user = await User.findById(req.user._id)
      .select('-password -tokens')
      .lean();

    res.json({
      ...user,
      // If you need role details
      role: await Role.findById(user.role).select('name permissions')
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};
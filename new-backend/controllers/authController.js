const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    
    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Get default role
    const defaultRole = await Role.findOne({ name: 'guest' });
    if (!defaultRole) return res.status(500).json({ error: 'Default role not configured' });

    // Create user
    const user = await User.create({ 
      email,
      password: await bcrypt.hash(password, 16),
      first_name,
      last_name,
      phone,
      role: defaultRole._id
    });

    // Generate and store token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    user.tokens.push(token);
    await user.save();

    res.status(201).json({ 
      user: user.toJSON(),
      token 
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
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
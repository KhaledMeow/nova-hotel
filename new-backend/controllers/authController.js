const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    let defaultRole = await Role.findOne({ name: 'guest' });
    if (!defaultRole) {
      defaultRole = await Role.create({
        name: 'guest',
        permissions: ['create_booking']
      });
    }

    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: defaultRole._id
    });

    const token = jwt.sign({ userId: user._id, role: user.roleName }, process.env.JWT_SECRET);
    user.tokens.push(token);
    await user.save();

    res.json({
      user: {
        _id: user._id },
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


    const user = await User.findOne({ email }).select('+password +tokens');
    if (!user) throw new Error('Invalid credentials');


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');


    const token = jwt.sign({ userId: user._id, role: user.roleName }, process.env.JWT_SECRET);
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

    const user = await User.findById(req.user._id)
      .select('-password -tokens')
      .lean();

    res.json({
      ...user,
      role: await Role.findById(user.role).select('name permissions')
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};
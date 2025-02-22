const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    
    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
   
    // Add default role assignment
     const defaultRole = await Role.findOne({ name: 'guest' }); 

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 16);
    
    // Create user
    const user = await User.create({ 
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role: defaultRole._id
    });

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  // JWT is stateless - client-side token invalidation
  res.json({ message: 'Logged out successfully' });
};
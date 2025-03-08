module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    if (!user.role || user.role.name !== 'admin') {
      throw new Error('Admin privileges required');
    }
    next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};
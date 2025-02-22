module.exports = (req, res, next) => {
  try {
    if (!req.user) throw new Error('User not authenticated');
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Admin privileges required'
      });
    }
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Authorization failed',
      message: error.message
    });
  }
};
module.exports = (req, res, next) => {
  // No async needed - role should already be in req.user from JWT
  if (req.user?.role === 'admin' || req.user?.role === 'staff') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      error: 'Admin/Staff privileges required' 
    });
  }
};
module.exports = (req, res, next) => {
  if (req.user?.roleName === 'admin' || req.user?.roleName === 'staff' || req.user?.role === '67b796f382f9002a043ad2aa' || req.user?.role === '67b796f382f9002a043ad2ab') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      error: 'Admin/Staff privileges required' 
    });
  }
};
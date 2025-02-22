const { body, validationResult } = require('express-validator');

exports.validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isAlphanumeric().withMessage('Username must be alphanumeric'),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().reduce((acc, err) => {
          acc[err.param] = err.msg;
          return acc;
        }, {})
      });
    }
    next();
  }
];

exports.validateBooking = [
  body('check_in_date')
    .isISO8601().withMessage('Invalid check-in date format')
    .custom((value, { req }) => {
      if (new Date(value) < new Date()) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  
  body('check_out_date')
    .isISO8601().withMessage('Invalid check-out date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.check_in_date)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().reduce((acc, err) => {
          acc[err.param] = err.msg;
          return acc;
        }, {})
      });
    }
    next();
  }
];
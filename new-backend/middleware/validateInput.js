const { body, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

exports.validateRegistration = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Invalid email address')
    .custom(async email => {
      const exists = await User.findOne({ email });
      if (exists) throw new Error('Email already registered');
    }),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),

  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 30 }).withMessage('Name too long'),

  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone().withMessage('Invalid phone number format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array().reduce((acc, { param, msg }) => {
          acc[param] = acc[param] || [];
          acc[param].push(msg);
          return acc;
        }, {})
      });
    }
    next();
  }
];

exports.validateBooking = [
  body('roomId')
    .notEmpty().withMessage('Room ID is required')
    .custom(id => isValidObjectId(id)).withMessage('Invalid Room ID'),

  body('check_in_date')
    .isISO8601().withMessage('Invalid check-in date format (use YYYY-MM-DD)')
    .toDate()
    .custom((date, { req }) => {
      if (new Date(date) < new Date().setHours(0,0,0,0)) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),

  body('check_out_date')
    .isISO8601().withMessage('Invalid check-out date format (use YYYY-MM-DD)')
    .toDate()
    .custom((date, { req }) => {
      if (date <= req.body.check_in_date) {
        throw new Error('Check-out date must be after check-in date');
      }
      if ((date - req.body.check_in_date) > 30 * 86400000) { 
        throw new Error('Maximum booking duration is 30 days');
      }
      return true;
    }),

  body('num_of_people')
    .isInt({ min: 1, max: 6 }).withMessage('Number of guests must be between 1-6'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array().reduce((acc, { param, msg }) => {
          acc[param] = acc[param] || [];
          acc[param].push(msg);
          return acc;
        }, {})
      });
    }
    
    req.body.check_in_date = new Date(req.body.check_in_date);
    req.body.check_out_date = new Date(req.body.check_out_date);
    
    next();
  }
];
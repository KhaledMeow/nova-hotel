const { ValidationError } = require('mongoose');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

module.exports = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = {};

  // Handle Mongoose Validation Errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    Object.keys(err.errors).forEach(field => {
      errors[field] = err.errors[field].message;
    });
  }

  // Handle JWT Errors
  else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = err instanceof TokenExpiredError 
      ? 'Session expired' 
      : 'Invalid token';
  }

  // Handle Custom Errors
  else if (err.statusCode && err.message) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: Object.keys(errors).length ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
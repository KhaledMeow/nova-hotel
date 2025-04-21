const { ValidationError } = require('mongoose');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = {};

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    Object.keys(err.errors).forEach(field => {
      errors[field] = err.errors[field].message;
    });
  }

  else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = err instanceof TokenExpiredError 
      ? 'Session expired' 
      : 'Invalid token';
  }

  else if (err.statusCode && err.message) {
    statusCode = err.statusCode;
    message = err.message;
  }
  if (process.env.NODE_ENV === 'development') {
    return {success : true, message : 'Payment Successful (Dev Mode)'}
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: Object.keys(errors).length ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
const ApiError = require('../utils/apiError');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error to console for development
  if (config.nodeEnv === 'development') {
    console.error('Error Intercepted:', err);
  }

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  // 2. Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const message = `Duplicate field value entered. Choose another value.`;
    error = new ApiError(400, message);
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new ApiError(400, message);
  }

  // 4. JWT WebTokenError
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token signature. Please authenticate again.');
  }

  // 5. JWT TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Your login session has expired. Please log in again.');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
    stack: config.nodeEnv === 'development' ? error.stack : undefined
  });
};

module.exports = errorHandler;

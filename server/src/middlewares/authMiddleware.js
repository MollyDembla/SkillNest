const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in cookies or Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Check if token exists
  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route. Please login first.'));
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // 4. Find user by id and select all fields except password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ApiError(401, 'User associated with this token no longer exists.'));
    }

    // 5. Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired. Please login again or refresh token.'));
    }
    return next(new ApiError(401, 'Not authorized. Invalid token format.'));
  }
});

module.exports = { protect };

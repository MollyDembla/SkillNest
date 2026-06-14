const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * Standard API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs || 15 * 60 * 1000, // 15 mins default
  max: config.rateLimitMax || 100, // limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP. Please try again after 15 minutes.'));
  }
});

/**
 * Strict limiter for sensitive authentication / payment endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login or validation attempts. Please try again after 15 minutes.'));
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};

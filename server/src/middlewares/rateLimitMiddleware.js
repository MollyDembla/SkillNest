const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

const isDev = config.nodeEnv !== 'production';

const skipLocalhost = (req) =>
  isDev && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1');

const skipLimit = (req) =>
  skipLocalhost(req) || process.env.DISABLE_RATE_LIMIT === 'true' || config.nodeEnv !== 'production';

/**
 * Standard API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs || 15 * 60 * 1000,
  max: config.rateLimitMax || 15000, // Increased default to prevent lockout
  skip: skipLimit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP. Please try again after 15 minutes.'));
  }
});

/**
 * Strict limiter for sensitive authentication / payment endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // Increased default to prevent lockout during intensive login testing
  skip: skipLimit,
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

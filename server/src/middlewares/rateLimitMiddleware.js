const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

const isDev = config.nodeEnv !== 'production';

const skipLocalhost = (req) =>
  isDev && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1');

/**
 * Standard API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs || 15 * 60 * 1000,
  max: config.rateLimitMax || 100,
  skip: skipLocalhost,
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
  max: 20,
  skip: skipLocalhost,
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

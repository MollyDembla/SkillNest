const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate JWT Access Token
 * @param {string} userId - The user ID to encode
 * @returns {string} - Signed JWT token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Generate JWT Refresh Token
 * @param {string} userId - The user ID to encode
 * @returns {string} - Signed JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};

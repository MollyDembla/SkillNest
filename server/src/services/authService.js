const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const ApiError = require('../utils/apiError');
const emailService = require('./emailService');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

/**
 * Register a new user and provision Cart & Wishlist
 * @param {object} userData - name, email, password, role
 * @returns {Promise<object>} - Registered User document
 */
const register = async (userData) => {
  const { name, email, password, role } = userData;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists.');
  }

  // 2. Create user (pre-save hook hashes password)
  const user = new User({
    name,
    email,
    password,
    role: role || 'student'
  });

  // 3. Generate verification token
  const rawToken = user.getEmailVerificationToken();
  await user.save();

  // 4. Provision Cart and Wishlist for user
  await Cart.create({ user: user._id, items: [] });
  await Wishlist.create({ user: user._id, courses: [] });

  

  // 5. Send verification email (non-blocking in dev, catches internally)
  //await emailService.sendVerificationEmail(user, rawToken);

  

  return user;
};

/**
 * Verify user email using token
 * @param {string} rawToken - Plain verification token
 */
const verifyEmail = async (rawToken) => {
  // Hash token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired email verification token.');
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  return user;
};

/**
 * Log in user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} - { user, accessToken, refreshToken }
 */
const login = async (email, password) => {
  // Find user and explicitly select password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  // Verify password hash
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  // Remove password field before returning user
  user.password = undefined;

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user,
    accessToken,
    refreshToken
  };
};

/**
 * Refresh Access Token
 * @param {string} refreshToken
 * @returns {Promise<object>} - { accessToken }
 */
const refresh = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'Session owner not found.');
    }

    const accessToken = generateAccessToken(user._id);
    return { accessToken };
  } catch (error) {
    throw new ApiError(401, 'Invalid session. Please login again.');
  }
};

/**
 * Generate a password reset token and return the reset URL directly.
 * No email is sent — the caller receives the URL to present to the user.
 * @param {string} email
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'No account found with that email address.');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.clientUrl}/auth/reset-password?token=${resetToken}`;
  return { resetUrl, name: user.name };
};

/**
 * Reset password
 * @param {string} rawToken - Plain reset token
 * @param {string} newPassword
 */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token.');
  }

  // Pre-save hook will hash this new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  forgotPassword,
  resetPassword
};

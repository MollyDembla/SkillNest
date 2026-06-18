const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

// Cookie options for secure storage of JWT refresh tokens
const cookieOptions = {
  httpOnly: true,
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax'
};

/**
 * Register a user
 */
const register = asyncHandler(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  
  // Set refresh token in secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified
        },
        accessToken
      },
      'User registered successfully. Please verify your email.'
    )
  );
});

/**
 * Verify email address
 */
const verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await authService.verifyEmail(req.params.token);

  res.status(200).json(
    new ApiResponse(
      200,
      { email: user.email, isEmailVerified: true },
      'Email verified successfully.'
    )
  );
});

/**
 * Log in user
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  // Set refresh token in secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified
        },
        accessToken
      },
      'Logged in successfully.'
    )
  );
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  
  const { accessToken } = await authService.refresh(token);

  res.status(200).json(
    new ApiResponse(
      200,
      { accessToken },
      'Token refreshed successfully.'
    )
  );
});

/**
 * Log out user
 */
const logout = asyncHandler(async (req, res, next) => {
  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    ...cookieOptions,
    expires: new Date(0)
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully.')
  );
});

/**
 * Forgot password link generator
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const result = await authService.forgotPassword(req.body.email);

  res.status(200).json(
    new ApiResponse(200, result, 'Reset link generated.')
  );
});

/**
 * Reset password executor
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  await authService.resetPassword(req.params.token, req.body.password);

  res.status(200).json(
    new ApiResponse(200, null, 'Password reset successfully.')
  );
});

/**
 * Get active session user
 */
const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
          bio: req.user.bio,
          isEmailVerified: req.user.isEmailVerified,
          stripeAccountId: req.user.stripeAccountId,
          stripeOnboardingComplete: req.user.stripeOnboardingComplete
        }
      },
      'Session profile retrieved successfully.'
    )
  );
});

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};

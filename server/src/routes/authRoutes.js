const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules
} = require('../validations/authValidation');

// 1. Public registration and email verification routes
router.post('/register', registerRules, validate, authController.register);
router.get('/verify-email/:token', authController.verifyEmail);

// 2. Sensitive login & logout routes (bind authentication rate limits)
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/logout', authController.logout);

// 3. Token refreshment route
router.post('/refresh-token', authController.refreshToken);

// 4. Password recovery routes
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, authController.resetPassword);

// 5. Protected profile routing
router.get('/me', protect, authController.getMe);

module.exports = router;
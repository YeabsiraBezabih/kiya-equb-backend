const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { authRateLimit } = require('../middleware/auth');
const {
  validateSignIn,
  validateSignUp,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} = require('../middleware/validation');

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// Public routes (no authentication required)
router.post('/signin', validateSignIn, authController.signIn);
router.post('/signup', validateSignUp, authController.signUp);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// Protected routes (authentication required)
router.post('/signout', authenticateToken, authController.signOut);
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

module.exports = router;

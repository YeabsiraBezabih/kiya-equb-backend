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

/**
 * @swagger
 * /api/mobile/auth/signin:
 *   post:
 *     summary: User sign in
 *     tags: [Authentication]
 *     description: Authenticate user with phone number and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: User phone number in international format
 *                 example: "+251911234567"
 *                 pattern: "^\\+[1-9]\\d{1,14}$"
 *               password:
 *                 type: string
 *                 description: User password (min 6 chars, must contain uppercase, lowercase, and number)
 *                 example: "Password123"
 *                 minLength: 6
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: User ID in format U followed by 9 alphanumeric characters
 *                       example: "UABC123DEF"
 *                     name:
 *                       type: string
 *                       description: User's first name
 *                       example: "John"
 *                     phoneNumber:
 *                       type: string
 *                       description: User phone number
 *                       example: "+251911234567"
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     joinedEqubs:
 *                       type: array
 *                       description: Array of equbs the user has joined
 *                       items:
 *                         type: object
 *                         properties:
 *                           equbId:
 *                             type: string
 *                             description: Equb ID
 *                             example: "EABC123DEF"
 *                           participationType:
 *                             type: string
 *                             enum: [full, half]
 *                             description: User's participation type in the equb
 *                           formNumber:
 *                             type: number
 *                             description: User's form number in the equb
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/signin', validateSignIn, authController.signIn);

/**
 * @swagger
 * /api/mobile/auth/signup:
 *   post:
 *     summary: User sign up
 *     tags: [Authentication]
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phoneNumber
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: User's full name (letters and spaces only)
 *                 example: "John Doe"
 *                 minLength: 2
 *                 maxLength: 100
 *                 pattern: "^[a-zA-Z\\s]+$"
 *               referralId:
 *                 type: string
 *                 description: Referral ID (optional)
 *                 example: "REF123"
 *               phoneNumber:
 *                 type: string
 *                 description: User phone number in international format
 *                 example: "+251911234567"
 *                 pattern: "^\\+[1-9]\\d{1,14}$"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address (optional)
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: User password (min 6 chars, must contain uppercase, lowercase, and number)
 *                 example: "Password123"
 *                 minLength: 6
 *                 maxLength: 128
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation (must match password)
 *                 example: "Password123"
 *                 minLength: 6
 *                 maxLength: 128
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: User ID in format U followed by 9 alphanumeric characters
 *                       example: "UABC123DEF"
 *                     name:
 *                       type: string
 *                       description: User's first name
 *                       example: "John"
 *                     phoneNumber:
 *                       type: string
 *                       description: User phone number
 *                       example: "+251911234567"
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     joinedEqubs:
 *                       type: array
 *                       description: Empty array for new users
 *                       items:
 *                         type: object
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/signup', validateSignUp, authController.signUp);

/**
 * @swagger
 * /api/mobile/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Get new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: JWT refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       description: New JWT refresh token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

/**
 * @swagger
 * /api/mobile/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     description: Send password reset code to user phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: User phone number in international format
 *                 example: "+251911234567"
 *                 pattern: "^\\+[1-9]\\d{1,14}$"
 *     responses:
 *       200:
 *         description: Password reset code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 resetCode:
 *                   type: string
 *                   description: 6-digit reset code (for testing purposes)
 *                   example: "123456"
 *                 message:
 *                   type: string
 *                   example: "Password reset code sent to your phone number"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

/**
 * @swagger
 * /api/mobile/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     description: Reset user password using phone number and reset code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: User phone number in international format
 *                 example: "+251911234567"
 *                 pattern: "^\\+[1-9]\\d{1,14}$"
 *               newPassword:
 *                 type: string
 *                 description: New password (min 6 chars, must contain uppercase, lowercase, and number)
 *                 example: "NewPassword123"
 *                 minLength: 6
 *                 maxLength: 128
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation (must match newPassword)
 *                 example: "NewPassword123"
 *                 minLength: 6
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid phone number, password mismatch, or invalid reset code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', validateResetPassword, authController.resetPassword);

/**
 * @swagger
 * /api/mobile/auth/signout:
 *   post:
 *     summary: User sign out
 *     tags: [Authentication]
 *     description: Sign out user and invalidate tokens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sign out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Signed out successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/signout', authenticateToken, authController.signOut);

/**
 * @swagger
 * /api/mobile/auth/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Authentication]
 *     description: Change user password (requires current password)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *                 example: "CurrentPassword123"
 *               newPassword:
 *                 type: string
 *                 description: New password (min 6 chars, must contain uppercase, lowercase, and number)
 *                 example: "NewPassword123"
 *                 minLength: 6
 *                 maxLength: 128
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation (must match newPassword)
 *                 example: "NewPassword123"
 *                 minLength: 6
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Invalid current password or new password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

module.exports = router;

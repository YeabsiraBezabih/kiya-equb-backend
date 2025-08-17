const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, isEqubMember, isCollectorOrAdmin, paymentRateLimit } = require('../middleware/auth');
const {
  validatePaymentHistory,
  validateProcessPayment,
  validateUnpaidMembers
} = require('../middleware/validation');

// Apply authentication to all payment routes
router.use(authenticateToken);

// Apply rate limiting to payment processing routes
router.use('/process-payment', paymentRateLimit);

/**
 * @swagger
 * /api/mobile/payments/{equbId}/payment-history:
 *   get:
 *     summary: Get payment history for an equb
 *     tags: [Payments]
 *     description: Get payment history for a specific equb with pagination and filtering (requires equb membership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equbId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^E[A-Z0-9]{9}$"
 *         description: ID of the equb - E followed by 9 alphanumeric characters
 *         example: "EABC123DEF"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           pattern: "^U[A-Z0-9]{9}$"
 *         description: Filter by specific user ID (optional)
 *         example: "UABC123DEF"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, unpaid, all]
 *           default: all
 *         description: Filter by payment status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
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
 *                     payments:
 *                       type: array
 *                       description: Array of formatted payment records
 *                       items:
 *                         type: object
 *                         properties:
 *                           paymentId:
 *                             type: string
 *                             description: Payment ID - P followed by 9 alphanumeric characters
 *                             example: "PABC123DEF"
 *                             pattern: "^P[A-Z0-9]{9}$"
 *                           roundNumber:
 *                             type: integer
 *                             description: Round number for the payment
 *                             example: 5
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             description: Date when payment was processed
 *                             example: "2025-01-15T10:30:00.000Z"
 *                           status:
 *                             type: string
 *                             enum: [paid, unpaid, pending, cancelled]
 *                             description: Payment status
 *                             example: "paid"
 *                           amountPaid:
 *                             type: number
 *                             description: Amount paid
 *                             example: 1000
 *                           paymentMethod:
 *                             type: string
 *                             enum: [cash, bank, mobile_money]
 *                             description: Method of payment
 *                             example: "cash"
 *                           userId:
 *                             type: string
 *                             description: User's MongoDB ObjectId
 *                             example: "507f1f77bcf86cd799439011"
 *                           userName:
 *                             type: string
 *                             description: User's full name
 *                             example: "John Doe"
 *                           formNumber:
 *                             type: integer
 *                             description: User's form number in the equb
 *                             example: 3
 *                           participationType:
 *                             type: string
 *                             enum: [full, half]
 *                             description: User's participation type
 *                             example: "full"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPaid:
 *                           type: number
 *                           description: Total amount paid
 *                           example: 15000
 *                         totalUnpaid:
 *                           type: number
 *                           description: Total amount unpaid
 *                           example: 5000
 *                         totalMembers:
 *                           type: integer
 *                           description: Total number of members
 *                           example: 20
 *                         paidMembers:
 *                           type: integer
 *                           description: Number of members who have paid
 *                           example: 15
 *                         unpaidMembers:
 *                           type: integer
 *                           description: Number of members who haven't paid
 *                           example: 5
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           description: Total number of payments
 *                           example: 45
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 3
 *                         hasNext:
 *                           type: boolean
 *                           description: Whether there are more pages
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           description: Whether there are previous pages
 *                           example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a member of this equb
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
router.get('/:equbId/payment-history', isEqubMember, validatePaymentHistory, paymentController.getPaymentHistory);

/**
 * @swagger
 * /api/mobile/payments/{equbId}/{userId}/payment-history:
 *   get:
 *     summary: Get user's payment history in an equb
 *     tags: [Payments]
 *     description: Get payment history for a specific user in a specific equb (requires equb membership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equbId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^E[A-Z0-9]{9}$"
 *         description: ID of the equb - E followed by 9 alphanumeric characters
 *         example: "EABC123DEF"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID (can be either custom userId like UABC123DEF or MongoDB ObjectId)
 *           example: "UABC123DEF"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User payment history retrieved successfully
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           description: User ID (custom format or MongoDB ObjectId)
 *                           example: "UABC123DEF"
 *                         userName:
 *                           type: string
 *                           description: User's full name
 *                           example: "John Doe"
 *                         formNumber:
 *                           type: integer
 *                           description: User's form number in the equb
 *                           example: 3
 *                         participationType:
 *                           type: string
 *                           enum: [full, half]
 *                           description: User's participation type
 *                           example: "full"
 *                         role:
 *                           type: string
 *                           enum: [member, collector, judge, writer, admin]
 *                           description: User's role in the equb
 *                           example: "member"
 *                         totalPayments:
 *                           type: integer
 *                           description: Total number of payments
 *                           example: 10
 *                         totalPaid:
 *                           type: integer
 *                           description: Number of paid payments
 *                           example: 8
 *                         totalUnpaid:
 *                           type: integer
 *                           description: Number of unpaid payments
 *                           example: 2
 *                         totalCancelled:
 *                           type: integer
 *                           description: Number of cancelled payments
 *                           example: 0
 *                         totalAmount:
 *                           type: number
 *                           description: Total amount of all payments
 *                           example: 10000
 *                     payments:
 *                       type: array
 *                       description: Array of user's payment records
 *                       items:
 *                         type: object
 *                         properties:
 *                           paymentId:
 *                             type: string
 *                             description: Payment ID
 *                             example: "PABC123DEF"
 *                           equbId:
 *                             type: string
 *                             description: Equb ID code
 *                             example: "EABC123DEF"
 *                           userId:
 *                             type: string
 *                             description: User's MongoDB ObjectId
 *                             example: "507f1f77bcf86cd799439011"
 *                           userName:
 *                             type: string
 *                             description: User's full name
 *                             example: "John Doe"
 *                           roundNumber:
 *                             type: integer
 *                             description: Round number for the payment
 *                             example: 5
 *                           amount:
 *                             type: number
 *                             description: Payment amount
 *                             example: 1000
 *                           paymentMethod:
 *                             type: string
 *                             enum: [cash, bank, mobile_money]
 *                             description: Method of payment
 *                             example: "cash"
 *                           status:
 *                             type: string
 *                             enum: [paid, unpaid, pending, cancelled]
 *                             description: Payment status
 *                             example: "paid"
 *                           notes:
 *                             type: string
 *                             description: Payment notes
 *                             example: "Payment received in person"
 *                           processedBy:
 *                             type: string
 *                             description: MongoDB ObjectId of user who processed the payment
 *                             example: "507f1f77bcf86cd799439012"
 *                           processedAt:
 *                             type: string
 *                             format: date-time
 *                             description: When payment was processed
 *                             example: "2025-01-15T10:30:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             description: Last update timestamp
 *                             example: "2025-01-15T10:30:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           description: Total number of payments
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 1
 *                         hasNext:
 *                           type: boolean
 *                           description: Whether there are more pages
 *                           example: false
 *                         hasPrev:
 *                           type: boolean
 *                           description: Whether there are previous pages
 *                           example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a member of this equb or target user is not a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb or user not found
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
router.get('/:equbId/:userId/payment-history', isEqubMember, paymentController.getUserPaymentHistory);

/**
 * @swagger
 * /api/mobile/payments/{equbId}/unpaid-members:
 *   get:
 *     summary: Get unpaid members for an equb
 *     tags: [Payments]
 *     description: Get list of members who haven't paid for the current or specified round (requires equb membership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equbId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^E[A-Z0-9]{9}$"
 *         description: ID of the equb - E followed by 9 alphanumeric characters
 *         example: "EABC123DEF"
 *       - in: query
 *         name: roundNumber
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Specific round number (optional, defaults to current round)
 *         example: 3
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Unpaid members retrieved successfully
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
 *                     unpaidMembers:
 *                       type: array
 *                       description: Array of unpaid members
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: User's MongoDB ObjectId
 *                             example: "507f1f77bcf86cd799439011"
 *                           name:
 *                             type: string
 *                             description: Member's full name
 *                             example: "John Doe"
 *                           participationType:
 *                             type: string
 *                             enum: [full, half]
 *                             description: Member's participation type
 *                             example: "full"
 *                           formNumber:
 *                             type: integer
 *                             description: Member's form number
 *                             example: 3
 *                           unpaidRounds:
 *                             type: array
 *                             description: Array of unpaid round numbers
 *                             items:
 *                               type: integer
 *                             example: [3, 4, 5]
 *                           totalUnpaid:
 *                             type: number
 *                             description: Total unpaid amount
 *                             example: 3000
 *                           lastPaymentDate:
 *                             type: string
 *                             format: date-time
 *                             description: Date of last payment (if any)
 *                             example: "2025-01-01T00:00:00.000Z"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalUnpaidMembers:
 *                           type: integer
 *                           description: Total number of unpaid members
 *                           example: 8
 *                         totalUnpaidAmount:
 *                           type: number
 *                           description: Total unpaid amount across all members
 *                           example: 24000
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           description: Total number of unpaid members
 *                           example: 8
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 1
 *                         hasNext:
 *                           type: boolean
 *                           description: Whether there are more pages
 *                           example: false
 *                         hasPrev:
 *                           type: boolean
 *                           description: Whether there are previous pages
 *                           example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a member of this equb
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
router.get('/:equbId/unpaid-members', isEqubMember, validateUnpaidMembers, paymentController.getUnpaidMembers);

/**
 * @swagger
 * /api/mobile/payments/{equbId}/payment-summary:
 *   get:
 *     summary: Get payment summary for an equb
 *     tags: [Payments]
 *     description: Get overall payment summary and statistics for a specific equb (requires equb membership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equbId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^E[A-Z0-9]{9}$"
 *         description: ID of the equb - E followed by 9 alphanumeric characters
 *         example: "EABC123DEF"
 *     responses:
 *       200:
 *         description: Payment summary retrieved successfully
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
 *                     currentRound:
 *                       type: integer
 *                       description: Current round number
 *                       example: 5
 *                     nextPaymentDate:
 *                       type: string
 *                       format: date-time
 *                       description: Next payment date
 *                       example: "2025-02-01T00:00:00.000Z"
 *                     totalMembers:
 *                       type: integer
 *                       description: Total number of members
 *                       example: 20
 *                     activeMembers:
 *                       type: integer
 *                       description: Number of active members
 *                       example: 18
 *                     inactiveMembers:
 *                       type: integer
 *                       description: Number of inactive members
 *                       example: 2
 *                     totalCollected:
 *                       type: number
 *                       description: Total amount collected for current round
 *                       example: 18000
 *                     totalExpected:
 *                       type: number
 *                       description: Total amount expected for current round
 *                       example: 20000
 *                     collectionRate:
 *                       type: number
 *                       description: Collection rate percentage
 *                       example: 90
 *                     roundProgress:
 *                       type: object
 *                       properties:
 *                         completed:
 *                           type: integer
 *                           description: Number of completed payments
 *                           example: 18
 *                         pending:
 *                           type: integer
 *                           description: Number of pending payments
 *                           example: 2
 *                         percentage:
 *                           type: number
 *                           description: Completion percentage
 *                           example: 90
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a member of this equb
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
router.get('/:equbId/payment-summary', isEqubMember, paymentController.getPaymentSummary);

/**
 * @swagger
 * /api/mobile/payments/process-payment:
 *   post:
 *     summary: Process payment
 *     tags: [Payments]
 *     description: Process a payment for a member in an equb (requires collector, admin, judge, or writer role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equbId
 *               - role
 *               - userId
 *               - roundNumber
 *               - paymentMethod
 *               - amount
 *             properties:
 *               equbId:
 *                 type: string
 *                 description: ID of the equb - E followed by 9 alphanumeric characters
 *                 example: "EABC123DEF"
 *                 pattern: "^E[A-Z0-9]{9}$"
 *               role:
 *                 type: string
 *                 enum: [collector, admin]
 *                 description: Role of the user processing the payment
 *                 example: "collector"
 *               userId:
 *                 type: string
 *                 description: ID of the user making the payment (can be custom userId like UABC123DEF or MongoDB ObjectId)
 *                 example: "UABC123DEF"
 *               roundNumber:
 *                 type: integer
 *                 description: Round number for the payment
 *                 example: 5
 *                 minimum: 1
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, bank, mobile_money]
 *                 description: Method of payment
 *                 example: "cash"
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *                 example: 1000
 *                 minimum: 0
 *               notes:
 *                 type: string
 *                 description: Additional notes about the payment (optional)
 *                 example: "Payment received in person"
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Payment processed successfully
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
 *                   example: "Payment processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       description: Payment ID - P followed by 9 alphanumeric characters
 *                       example: "PABC123DEF"
 *                     transactionId:
 *                       type: string
 *                       description: Generated transaction ID
 *                       example: "TXN1705312345678ABC123"
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *                       description: When payment was processed
 *                       example: "2025-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or invalid payment data
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
 *       403:
 *         description: Forbidden - User is not a collector, admin, judge, or writer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb or member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - Rate limit exceeded
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
router.post('/process-payment', isCollectorOrAdmin, validateProcessPayment, paymentController.processPayment);

/**
 * @swagger
 * /api/mobile/payments/{paymentId}/mark-unpaid:
 *   put:
 *     summary: Mark payment as unpaid
 *     tags: [Payments]
 *     description: Mark a previously paid payment as unpaid (requires collector or admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^P[A-Z0-9]{9}$"
 *         description: ID of the payment - P followed by 9 alphanumeric characters
 *         example: "PABC123DEF"
 *     responses:
 *       200:
 *         description: Payment marked as unpaid successfully
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
 *                   example: "Payment marked as unpaid successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a collector or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
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
router.put('/:paymentId/mark-unpaid', isCollectorOrAdmin, paymentController.markPaymentAsUnpaid);

/**
 * @swagger
 * /api/mobile/payments/{paymentId}/cancel:
 *   put:
 *     summary: Cancel payment
 *     tags: [Payments]
 *     description: Cancel a payment (requires collector or admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^P[A-Z0-9]{9}$"
 *         description: ID of the payment - P followed by 9 alphanumeric characters
 *         example: "PABC123DEF"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancelling the payment
 *                 example: "Payment was made in error"
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
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
 *                   example: "Payment cancelled successfully"
 *       400:
 *         description: Validation error or missing reason
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
 *       403:
 *         description: Forbidden - User is not a collector or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
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
router.put('/:paymentId/cancel', isCollectorOrAdmin, paymentController.cancelPayment);

module.exports = router; 
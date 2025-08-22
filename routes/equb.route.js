const express = require('express');
const router = express.Router();
const equbController = require('../controllers/equb.controller');

const { authenticateToken, isEqubMember, isEqubAdmin, equbCreationRateLimit } = require('../middleware/auth');
const {
  validateDiscoverEqubs,
  validateJoinEqub,
  validateGetMyEqubs,
  validateAddMember,
  validateUpdateMemberRole,
  validatePostRoundWinner,
  validateUpdateEqub,
  validateEqubCreation
} = require('../middleware/validation');

// Apply authentication to all equb routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/mobile/equbs/create:
 *   post:
 *     summary: Create new Ekub
 *     tags: [Equbs]
 *     description: Create a new equb with the specified configuration and optional team members
 *     operationId: createEqub
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - numberOfMembers
 *               - totalSaving
 *               - duration
 *               - level
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the equb
 *                 example: "Monthly Savings Group"
 *                 minLength: 3
 *                 maxLength: 100
 *               numberOfMembers:
 *                 type: integer
 *                 description: Number of members for the equb
 *                 example: 20
 *                 minimum: 5
 *                 maximum: 500
 *               totalSaving:
 *                 type: number
 *                 description: Total amount to be saved per round (will be divided among members)
 *                 example: 20000
 *                 minimum: 1000
 *                 maximum: 500000
 *               duration:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 description: Duration of each round
 *                 example: "monthly"
 *               level:
 *                 type: string
 *                 enum: [old, new]
 *                 description: Level of the equb
 *                 example: "new"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date for the equb
 *                 example: "2025-01-01"
 *               bankAccountDetail:
 *                 type: array
 *                 description: Bank account details for the equb (optional, max 5 accounts)
 *                 maxItems: 5
 *                 items:
 *                   type: object
 *                   properties:
 *                     bankName:
 *                       type: string
 *                       description: Name of the bank
 *                       example: "Commercial Bank of Ethiopia"
 *                       minLength: 2
 *                       maxLength: 100
 *                     accountNumber:
 *                       type: string
 *                       description: Bank account number
 *                       example: "1000123456789"
 *                       minLength: 5
 *                       maxLength: 50
 *                     accountType:
 *                       type: string
 *                       description: Type of account
 *                       example: "checking"
 *                       enum: [checking, savings]
 *                     accountHolder:
 *                       type: string
 *                       description: Name of account holder
 *                       example: "John Doe"
 *                       minLength: 2
 *                       maxLength: 100
 *               collectorsInfo:
 *                 type: array
 *                 description: Information about collectors (optional, max 10 collectors)
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       description: Full name of the collector
 *                       example: "Jane Smith"
 *                       minLength: 2
 *                       maxLength: 100
 *                     phoneNumber:
 *                       type: string
 *                       description: Phone number in international format
 *                       example: "+251911234567"
 *                       pattern: "^\\+?[1-9]\\d{1,14}$"
 *                     slotNumber:
 *                       type: string
 *                       description: Slot number for the collector (optional)
 *                       example: "2"
 *                     password:
 *                       type: string
 *                       description: Password for the collector (optional, min 6 chars)
 *                       example: "Password123"
 *                       minLength: 6
 *                       maxLength: 128
 *               judgesInfo:
 *                 type: array
 *                 description: Information about judges (optional, max 5 judges)
 *                 maxItems: 5
 *                 items:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       description: Full name of the judge
 *                       example: "Bob Johnson"
 *                       minLength: 2
 *                       maxLength: 100
 *                     phoneNumber:
*                       type: string
*                       description: Phone number in international format
*                       example: "+251922345678"
*                       pattern: "^\\+?[1-9]\\d{1,14}$"
 *                     slotNumber:
 *                       type: string
 *                       description: Slot number for the judge (optional)
 *                       example: "3"
 *                     password:
 *                       type: string
 *                       description: Password for the collector (optional, min 6 chars)
 *                       example: "Password123"
 *                       minLength: 6
 *                       maxLength: 128
 *               writersInfo:
 *                 type: array
 *                 description: Information about writers (optional, max 5 writers)
 *                 maxItems: 5
 *                 items:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       description: Full name of the writer
 *                       example: "Alice Brown"
 *                       minLength: 2
 *                       maxLength: 100
 *                     phoneNumber:
*                       type: string
*                       description: Phone number in international format
*                       example: "+251933456789"
*                       pattern: "^\\+?[1-9]\\d{1,14}$"
 *                     slotNumber:
 *                       type: string
 *                       description: Slot number for the writer (optional)
 *                       example: "4"
 *                     password:
 *                       type: string
 *                       description: Password for the writer (optional, min 6 chars)
 *                       example: "Password123"
 *                       minLength: 6
 *                       maxLength: 128
 *     responses:
 *       201:
 *         description: Equb created successfully
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
 *                   example: "Ekub created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     equbId:
 *                       type: string
 *                       description: MongoDB ObjectId of the created equb
 *                       example: "507f1f77bcf86cd799439011"
 *                     equbIdCode:
 *                       type: string
 *                       description: Generated equb ID code - E followed by 9 alphanumeric characters
 *                       example: "EABC123DEF"
 *                       pattern: "^E[A-Z0-9]{9}$"
 *                     name:
 *                       type: string
 *                       description: Name of the equb
 *                       example: "Monthly Savings Group"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       description: Start date of the equb
 *                       example: "2025-01-01"
 *                     maxMembers:
 *                       type: integer
 *                       description: Maximum number of members
 *                       example: 20
 *                     saving:
 *                       type: number
 *                       description: Total saving amount per round
 *                       example: 20000
 *                     roundDuration:
 *                       type: string
 *                       description: Duration of each round
 *                       example: "monthly"
 *                     level:
 *                       type: string
 *                       description: Level of the equb
 *                       example: "new"
 *                     bankAccountDetail:
 *                       type: array
 *                       description: Bank account details
 *                       items:
 *                         type: object
 *                         properties:
 *                             bankName:
 *                               type: string
 *                             accountNumber:
 *                               type: string
 *                             accountHolder:
 *                               type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *       400:
 *         description: Validation error or invalid data
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
 *       413:
 *         description: File too large (5MB limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - Rate limit exceeded (10 requests per minute)
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
router.post('/create', 
  authenticateToken, // Authentication first
  equbCreationRateLimit, // Then rate limiting
  validateEqubCreation, 
  equbController.createEqub
);

/**
 * @swagger
 * /api/mobile/equbs/discover-equbs:
 *   get:
 *     summary: Discover available equbs
 *     tags: [Equbs]
 *     description: Get a paginated list of available equbs that the user can join, with filtering options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [public, private, all]
 *           default: all
 *         description: Filter by equb type
 *       - in: query
 *         name: roundDuration
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, all]
 *           default: all
 *         description: Filter by contribution frequency
 *       - in: query
 *         name: savingAmount
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Filter by maximum saving amount - equbs with saving less than or equal to this amount
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of available equbs retrieved successfully
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
 *                     equbs:
 *                       type: array
 *                       description: Array of available equbs
 *                       items:
 *                         type: object
 *                         properties:
 *                           equbId:
 *                             type: string
 *                             description: Generated equb ID code - E followed by 9 alphanumeric characters
 *                             example: "EABC123DEF"
 *                             pattern: "^E[A-Z0-9]{9}$"
 *                           name:
 *                             type: string
 *                             description: Equb name
 *                             example: "Monthly Savings Group"
 *                           description:
 *                             type: string
 *                             description: Equb description
 *                             example: "A monthly savings group for community members"
 *                           type:
 *                             type: string
 *                             enum: [public, private]
 *                             description: Equb type
 *                             example: "public"
 *                           roundDuration:
 *                             type: string
 *                             enum: [daily, weekly, monthly]
 *                             description: Duration of each round
 *                             example: "monthly"
 *                           saving:
 *                             type: number
 *                             description: Amount to be saved per round
 *                             example: 1000
 *                           membersNum:
 *                             type: integer
 *                             description: Current number of members
 *                             example: 15
 *                           maxMembers:
 *                             type: integer
 *                             description: Maximum number of members
 *                             example: 20
 *                           startDate:
 *                             type: string
 *                             format: date
 *                             description: Start date of the equb
 *                             example: "2025-01-01"
 *                           location:
 *                             type: string
 *                             description: Equb location
 *                             example: "Addis Ababa"
 *                           createdBy:
 *                             type: string
 *                             description: Creator's full name
 *                             example: "John Doe"
 *                           isJoined:
 *                             type: boolean
 *                             description: Whether the current user is already a member
 *                             example: false
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
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           description: Total number of equbs
 *                           example: 25
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/discover-equbs', validateDiscoverEqubs, equbController.discoverEqubs);

/**
 * @swagger
 * /api/mobile/equbs/join-equb:
 *   post:
 *     summary: Join an equb
 *     tags: [Equbs]
 *     description: Join an existing equb as a member
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
 *               - participationType
 *               - slotNumber
 *             properties:
 *               equbId:
 *                 type: string
 *                 description: ID of the equb to join - E followed by 9 alphanumeric characters
 *                 example: "EABC123DEF"
 *                 pattern: "^E[A-Z0-9]{9}$"
 *               participationType:
 *                 type: string
 *                 enum: [full, half]
 *                 description: Type of participation
 *                 example: "full"
 *               slotNumber:
 *                 type: integer
 *                 minimum: 1
 *                 description: Slot number for the member
 *                 example: 1
 *               secretNumber:
 *                 type: string
 *                 maxLength: 6
 *                 minLength: 6
 *                 description: Secret number for private equbs (required if equb is private)
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Successfully joined the equb
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
 *                   example: "Successfully joined the equb"
 *                 data:
 *                   type: object
 *                   properties:
 *                     equbId:
 *                       type: string
 *                       description: Equb ID code
 *                       example: "EABC123DEF"
 *                     participationType:
 *                       type: string
 *                       enum: [full, half]
 *                       description: User's participation type
 *                       example: "full"
 *                     slotNumber:
 *                       type: integer
 *                       description: User's slot number
 *                       example: 1
 *       400:
 *         description: Validation error, equb is full, slot number taken, or secret number required/invalid
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
 *         description: Equb not found
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
router.post('/join-equb', validateJoinEqub, equbController.joinEqub);

/**
 * @swagger
 * /api/mobile/equbs/my-equbs:
 *   get:
 *     summary: Get user's equbs
 *     tags: [Equbs]
 *     description: Get a list of equbs that the user is a member of
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's equbs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   description: Array of user's equbs
 *                   items:
 *                     type: object
 *                     properties:
 *                       equbId:
 *                         type: string
 *                         description: Equb ID code
 *                         example: "EABC123DEF"
 *                       name:
 *                         type: string
 *                         description: Equb name
 *                         example: "Monthly Savings Group"
 *                       participationType:
 *                         type: string
 *                         enum: [full, half]
 *                         description: User's participation type
 *                         example: "full"
 *                       slotNumber:
 *                         type: integer
 *                         description: User's slot number
 *                         example: 1
 *                       role:
 *                         type: string
 *                         enum: [member, collector, judge, writer, admin]
 *                         description: User's role in the equb
 *                         example: "member"
 *                       saving:
 *                         type: number
 *                         description: Amount to be saved per round
 *                         example: 1000
 *                       roundDuration:
 *                         type: string
 *                         enum: [daily, weekly, monthly]
 *                         description: Duration of each round
 *                         example: "monthly"
 *                       nextPaymentDate:
 *                         type: string
 *                         format: date-time
 *                         description: Next payment date
 *                         example: "2025-02-01T00:00:00.000Z"
 *                       paymentStatus:
 *                         type: string
 *                         enum: [paid, unpaid, pending, cancelled]
 *                         description: Payment status for current round
 *                         example: "pending"
 *                       totalMembers:
 *                         type: integer
 *                         description: Total number of members
 *                         example: 20
 *                       activeMembers:
 *                         type: integer
 *                         description: Number of active members
 *                         example: 18
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
router.get('/my-equbs', equbController.getMyEqubs);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}:
 *   get:
 *     summary: Get equb details
 *     tags: [Equbs]
 *     description: Get detailed information about a specific equb (requires membership)
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
 *         description: Equb details retrieved successfully
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
 *                     equbId:
 *                       type: string
 *                       description: Equb ID code
 *                       example: "EABC123DEF"
 *                     name:
 *                       type: string
 *                       description: Equb name
 *                       example: "Monthly Savings Group"
 *                     description:
 *                       type: string
 *                       description: Equb description
 *                       example: "A monthly savings group for community members"
 *                     membersNum:
 *                       type: integer
 *                       description: Current number of members
 *                       example: 15
 *                     maxMembers:
 *                       type: integer
 *                       description: Maximum number of members
 *                       example: 20
 *                     saving:
 *                       type: number
 *                       description: Amount to be saved per round
 *                       example: 1000
 *                     level:
 *                       type: string
 *                       enum: [old, new]
 *                       description: Equb level - new if currentRound less than or equal to 12, old otherwise
 *                       example: "new"
 *                     type:
 *                       type: string
 *                       enum: [public, private]
 *                       description: Equb type
 *                       example: "public"
 *                     roundDuration:
 *                       type: string
 *                       enum: [daily, weekly, monthly]
 *                       description: Duration of each round
 *                       example: "monthly"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       description: Start date of the equb
 *                       example: "2025-01-01"
 *                     nextRoundDate:
 *                       type: string
 *                       format: date-time
 *                       description: Next round date
 *                       example: "2025-02-01T00:00:00.000Z"
 *                     currentRound:
 *                       type: integer
 *                       description: Current round number
 *                       example: 1
 *                     totalRounds:
 *                       type: integer
 *                       description: Total number of rounds
 *                       example: 20
 *                     bankAccountDetail:
 *                       type: array
 *                       description: Bank account details
 *                       items:
 *                         type: object
 *                         properties:
 *                           bankName:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           accountHolder:
 *                             type: string
 *                     collectorsInfo:
 *                       type: array
 *                       description: Information about collectors
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: Collector's MongoDB ObjectId
 *                           name:
 *                             type: string
 *                             description: Collector's full name
 *                           phone:
 *                             type: string
 *                             description: Collector's phone number
 *                     judgInfo:
 *                       type: array
 *                       description: Information about judges
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: Judge's MongoDB ObjectId
 *                           name:
 *                             type: string
 *                             description: Judge's full name
 *                           phone:
 *                             type: string
 *                             description: Judge's phone number
 *                     writersInfo:
 *                       type: array
 *                       description: Information about writers
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: Writer's MongoDB ObjectId
 *                           name:
 *                             type: string
 *                             description: Writer's full name
 *                           phone:
 *                             type: string
 *                             description: Writer's phone number
 *                     members:
 *                       type: array
 *                       description: Array of equb members
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: Member's MongoDB ObjectId
 *                           name:
 *                             type: string
 *                             description: Member's full name
 *                           participationType:
 *                             type: string
 *                             enum: [full, half]
 *                             description: Member's participation type
 *                           slotNumber:
 *                             type: integer
 *                             description: Member's slot number
 *                           role:
 *                             type: string
 *                             enum: [member, collector, judge, writer, admin]
 *                             description: Member's role
 *                           paymentHistory:
 *                             type: array
 *                             description: Member's payment history
 *                             items:
 *                               type: object
 *                               properties:
 *                                 roundNumber:
 *                                   type: integer
 *                                   description: Round number
 *                                 date:
 *                                   type: string
 *                                   format: date-time
 *                                   description: Payment date
 *                                 status:
 *                                   type: string
 *                                   enum: [paid, unpaid, pending, cancelled]
 *                                   description: Payment status
 *                                 amountPaid:
 *                                   type: number
 *                                   description: Amount paid
 *                                 paymentMethod:
 *                                   type: string
 *                                   enum: [cash, bank, mobile_money]
 *                                   description: Payment method
 *                                 notes:
 *                                   type: string
 *                                   description: Payment notes
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
 *       404:
 *         description: Equb not found
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
router.get('/:equbId', equbController.getEqubDetails);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/add-members:
 *   post:
 *     summary: Add new member to equb
 *     tags: [Equbs]
 *     description: Add a new member to the equb (requires admin, collector, judge, or writer role)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - slotNumber
 *               - participationType
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the new member (letters and spaces only)
 *                 example: "Jane Smith"
 *                 minLength: 2
 *                 maxLength: 100
 *                 pattern: "^[a-zA-Z\\s]+$"
 *               slotNumber:
 *                 type: integer
 *                 minimum: 1
 *                 description: Slot number for the member
 *                 example: 5
 *               participationType:
 *                 type: string
 *                 enum: [full, half]
 *                 description: Type of participation
 *                 example: "full"
 *               phone:
 *                 type: string
 *                 description: Phone number in international format
 *                 example: "+251911234567"
 *                 pattern: "^\\+[1-9]\\d{1,14}$"
 *               secretNumber:
 *                 type: string
 *                 maxLength: 6
 *                 minLength: 6
 *                 description: Secret number for private equbs (optional)
 *                 example: "123456"
 *               paidRounds:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Number of rounds already paid
 *                 example: 0
 *     responses:
 *       200:
 *         description: Member added successfully
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
 *                   example: "Member added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: Generated user ID - U followed by 9 alphanumeric characters
 *                       example: "UABC123DEF"
 *                     memberId:
 *                       type: string
 *                       description: MongoDB ObjectId of the new member
 *                       example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Validation error, equb is full, slot number taken, or phone already a member
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
 *         description: Forbidden - User is not an admin, collector, judge, or writer of this equb
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb not found
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
router.post('/:equbId/add-members', isEqubAdmin, validateAddMember, equbController.addMember);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/members/{userId}:
 *   delete:
 *     summary: Remove member from equb
 *     tags: [Equbs]
 *     description: Remove a member from the equb (requires admin role only)
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
 *           pattern: "^U[A-Z0-9]{9}$"
 *         description: ID of the user - U followed by 9 alphanumeric characters
 *         example: "UABC123DEF"
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: "Member removed successfully"
 *       400:
 *         description: Cannot remove admin member
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
 *         description: Forbidden - User is not an admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb, user, or member not found
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

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/members/{userId}:
 *   delete:
 *     summary: Remove member from equb
 *     tags: [Equbs]
 *     description: Remove a member from the equb (requires admin role only)
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
 *           pattern: "^U[A-Z0-9]{9}$"
 *         description: ID of the user - U followed by 9 alphanumeric characters
 *         example: "UABC123DEF"
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: "Member removed successfully"
 *       400:
 *         description: Cannot remove admin member
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
 *         description: Forbidden - User is not an admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb, user, or member not found
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
router.delete('/:equbId/members/:userId', isEqubAdmin, equbController.removeMember);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/members/{userId}/role:
 *   put:
 *     summary: Update member role
 *     tags: [Equbs]
 *     description: Update the role of a member in the equb (requires admin role only)
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
 *           pattern: "^U[A-Z0-9]{9}$"
 *         description: ID of the user - U followed by 9 alphanumeric characters
 *         example: "UABC123DEF"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [member, collector, judge, writer, admin]
 *                 description: New role for the member
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Member role updated successfully
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
 *                   example: "Member role updated successfully"
 *       400:
 *         description: Validation error or cannot update admin member role
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
 *         description: Forbidden - User is not an admin of this equb
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
router.put('/:equbId/members/:userId/role', isEqubAdmin, validateUpdateMemberRole, equbController.updateMemberRole);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/get-members:
 *   get:
 *     summary: Get equb members
 *     tags: [Equbs]
 *     description: Get a list of all members in the equb (requires membership)
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
 *         description: Equb members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   description: Array of equb members
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         description: Member's MongoDB ObjectId
 *                       name:
 *                         type: string
 *                         description: Member's full name
 *                       participationType:
 *                         type: string
 *                         enum: [full, half, quarter]
 *                         description: Member's participation type
 *                       slotNumber:
 *                         type: integer
 *                         description: Member's slot number
 *                       role:
 *                         type: string
 *                         enum: [member, collector, judge, writer, admin]
 *                         description: Member's role
 *                       phone:
 *                         type: string
 *                         description: Member's phone number
 *                       isActive:
 *                         type: boolean
 *                         description: Whether the member is active
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
 *       404:
 *         description: Equb not found
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
router.get('/:equbId/get-members', isEqubMember, equbController.getEqubMembers);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/get-winners:
 *   get:
 *     summary: Get round winners
 *     tags: [Equbs]
 *     description: Get information about round winners for a specific equb (requires membership)
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
 *         description: Round winners retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   description: Array of round winners
 *                   items:
 *                         type: object
 *                         properties:
 *                           roundNumber:
 *                             type: integer
 *                             description: Round number
 *                           winners:
 *                             type: array
 *                             description: Array of winners for this round
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   description: Winner's full name
 *                                 phone:
 *                                   type: string
 *                                   description: Winner's phone number
 *                                 slotNumber:
 *                                   type: integer
 *                                   description: Winner's slot number
 *                                 unpaidRounds:
 *                                   type: integer
 *                                   description: Number of unpaid rounds
 *                                 paidRounds:
 *                                   type: integer
 *                                   description: Number of paid rounds
 *                                 participationType:
 *                                   type: string
 *                                   enum: [full, half, quarter]
 *                                   description: Winner's participation type
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
 *       404:
 *         description: Equb not found
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
router.get('/:equbId/get-winners', isEqubMember, equbController.getRoundWinners);

/**
 * @swagger
 * /api/mobile/equbs/unpaid-members:
 *   get:
 *     summary: Get unpaid members across all equbs
 *     tags: [Equbs]
 *     description: Get a list of unpaid members across all equbs the user is a member of
 *     security:
 *       - bearerAuth: []
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
 *                   type: array
 *                   description: Array of unpaid members
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         description: Member's MongoDB ObjectId
 *                       name:
 *                         type: string
 *                         description: Member's full name
 *                       unpaidRounds:
 *                         type: integer
 *                         description: Number of unpaid rounds
 *                       slotNumber:
 *                         type: integer
 *                         description: Member's slot number
 *                       phone:
 *                         type: string
 *                         description: Member's phone number
 *                       paidRounds:
 *                         type: integer
 *                         description: Number of paid rounds
 *                       equbId:
 *                         type: string
 *                         description: Equb ID code
 *                       equbName:
 *                         type: string
 *                         description: Equb name
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
router.get('/unpaid-members', authenticateToken, equbController.getUnpaidMembers);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/creation-details:
 *   get:
 *     summary: Get Ekub creation details
 *     tags: [Equbs]
 *     description: Get detailed information about a specific equb creation (accessible to creator and members only)
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
 *         description: Equb creation details retrieved successfully
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
 *                   example: "Ekub details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     equb:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: MongoDB ObjectId
 *                           example: "507f1f77bcf86cd799439011"
 *                         equbId:
 *                           type: string
 *                           description: Generated equb ID code
 *                           example: "EABC123DEF"
 *                         name:
 *                           type: string
 *                           description: Equb name
 *                           example: "Monthly Savings Group"
 *                         status:
 *                           type: string
 *                           enum: [active, inactive]
 *                           description: Current status of the equb
 *                           example: "active"
 *                         currentMembers:
 *                           type: integer
 *                           description: Current number of members
 *                           example: 5
 *                         maxMembers:
 *                           type: integer
 *                           description: Maximum number of members
 *                           example: 20
 *                         perMemberAmount:
 *                           type: number
 *                           description: Amount per member per round
 *                           example: 1000
 *                         totalAmount:
 *                           type: number
 *                           description: Total amount per round
 *                           example: 20000
 *                         roundDuration:
 *                           type: string
 *                           description: Duration of each round
 *                           example: "monthly"
 *                         level:
 *                           type: string
 *                           description: Level of the equb
 *                           example: "new"
 *                         startDate:
 *                           type: string
 *                           format: date
 *                           description: Start date of the equb
 *                           example: "2025-01-01"
 *                         bankAccountDetail:
 *                           type: array
 *                           description: Bank account details
 *                           items:
 *                             type: object
 *                             properties:
 *                               bankName:
 *                                 type: string
 *                               accountNumber:
 *                                 type: string
 *                               accountHolder:
 *                                 type: string

 *                         creator:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               description: Creator's MongoDB ObjectId
 *                             fullName:
 *                               type: string
 *                               description: Creator's full name
 *                             phoneNumber:
 *                               type: string
 *                               description: Creator's phone number
 *                             profilePicture:
 *                               type: string
 *                               description: Creator's profile picture URL
 *                         members:
 *                           type: array
 *                           description: Array of equb members
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Member's MongoDB ObjectId
 *                               fullName:
 *                                 type: string
 *                                 description: Member's full name
 *                               phoneNumber:
 *                                 type: string
 *                                 description: Member's phone number
 *                               profilePicture:
 *                                 type: string
 *                                 description: Member's profile picture URL
 *                               role:
 *                                 type: string
 *                                 enum: [member, collector, judge, writer, admin]
 *                                 description: Member's role in the equb
 *                               joinedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 description: When the member joined
 *                               isActive:
 *                                 type: boolean
 *                                 description: Whether the member is active
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           description: Creation timestamp
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: Last update timestamp
 *       400:
 *         description: Invalid equb ID format
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
 *         description: Forbidden - User is not the creator or member of this equb
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb not found
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
router.get('/:equbId/creation-details', equbController.getEqubCreationDetails);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/post-round-winner:
 *   post:
 *     summary: Post round winner
 *     tags: [Equbs]
 *     description: Post round winner for a specific equb (requires admin role)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotNumbers
 *               - participationType
 *             properties:
 *               slotNumbers:
 *                 type: array
 *                 description: Array of slot numbers for winners
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [5, 12]
 *               participationType:
 *                 type: string
 *                 enum: [full, half, quarter]
 *                 description: Type of participation for this round
 *                 example: "half"
 *     responses:
 *       200:
 *         description: Round winner posted successfully
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
 *                   example: "Round winner posted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     roundNumber:
 *                       type: integer
 *                       description: Round number
 *                     winners:
 *                       type: array
 *                       description: Array of winners
 *                       items:
 *                         type: object
 *                         properties:
 *                           slotNumber:
 *                             type: integer
 *                             description: Winner's slot number
 *                           participationType:
 *                             type: string
 *                             enum: [full, half, quarter]
 *                             description: Participation type
 *       400:
 *         description: Validation error or invalid slot numbers
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
 *         description: Forbidden - User is not an admin of this equb
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb not found
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
router.post('/:equbId/post-round-winner', isEqubAdmin, validatePostRoundWinner, equbController.postRoundWinner);

/**
 * @swagger
 * /api/mobile/equbs/update/{equbId}:
 *   put:
 *     summary: Update equb information
 *     tags: [Equbs]
 *     description: Update equb information including collectors, judges, and writers (requires admin role)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collectorsInfo:
 *                 type: array
 *                 description: Updated collectors information
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: Collector's MongoDB ObjectId
 *                     name:
 *                       type: string
 *                       description: Collector's full name
 *                     phone:
 *                       type: string
 *                       description: Collector's phone number
 *               judgInfo:
 *                 type: array
 *                 description: Updated judges information
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: Judge's MongoDB ObjectId
 *                     name:
 *                       type: string
 *                       description: Judge's full name
 *                     phone:
 *                       type: string
 *                       description: Judge's phone number
 *               writersInfo:
 *                 type: array
 *                 description: Updated writers information
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: Writer's MongoDB ObjectId
 *                     name:
 *                       type: string
 *                       description: Writer's full name
 *                     phone:
 *                       type: string
 *                       description: Writer's phone number
 *     responses:
 *       200:
 *         description: Equb updated successfully
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
 *                   example: "Equb updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     equbId:
 *                       type: string
 *                       description: Equb ID code
 *                     collectorsInfo:
 *                       type: array
 *                       description: Updated collectors information
 *                     judgInfo:
 *                       type: array
 *                       description: Updated judges information
 *                     writersInfo:
 *                       type: array
 *                       description: Updated writers information
 *       400:
 *         description: Validation error
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
 *         description: Forbidden - User is not an admin of this equb
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Equb not found
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
router.put('/update/:equbId', isEqubAdmin, validateUpdateEqub, equbController.updateEqub);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/available-form-numbers:
 *   get:
 *     summary: Get available form numbers for winner selection
 *     tags: [Equbs]
 *     description: Get available form numbers that can be selected as winners (excludes previous winners)
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
 *         description: Available form numbers retrieved successfully
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
 *                     totalSlots:
 *                       type: integer
 *                       description: Total number of slots in the equb
 *                     completedRounds:
 *                       type: integer
 *                       description: Number of completed rounds
 *                     availableSlots:
 *                       type: array
 *                       description: Array of available slots for winner selection
 *                       items:
 *                         type: object
 *                         properties:
 *                           slotNumber:
 *                             type: integer
 *                             description: Slot number of the slot
 *                           slotMembers:
 *                             type: array
 *                             description: Members sharing this slot
 *                           totalSlotAmount:
 *                             type: number
 *                             description: Total amount for this slot
 *                           isEligible:
 *                             type: boolean
 *                             description: Whether all members in the slot have paid for current round
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin or judge of this equb
 *       404:
 *         description: Equb not found
 *       500:
 *         description: Internal server error
 */
router.get('/:equbId/available-slot-numbers-for-winner', 
  authenticateToken, 
  equbController.getAvailableSlotNumbersForWinner
);

/**
 * @swagger
 * /api/mobile/equbs/{equbId}/available-slot-numbers:
 *   get:
 *     summary: Get available slot numbers for manual assignment
 *     tags: [Equbs]
 *     description: Get all available slot numbers that can be manually assigned to new members
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
 *         description: Available slot numbers retrieved successfully
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
 *                     equbId:
 *                       type: string
 *                       description: Equb ID
 *                     equbName:
 *                       type: string
 *                       description: Equb name
 *                     totalSlots:
 *                       type: integer
 *                       description: Total number of slots in the equb
 *                     usedSlots:
 *                       type: integer
 *                       description: Number of slots currently in use
 *                     availableSlots:
 *                       type: array
 *                       description: Array of available slot numbers
 *                       items:
 *                         type: integer
 *                     currentSlotUsage:
 *                       type: array
 *                       description: Current usage of all slots
 *                       items:
 *                         type: object
 *                         properties:
 *                           slotNumber:
 *                             type: integer
 *                           memberName:
 *                             type: string
 *                           participationType:
 *                             type: string
 *                           role:
 *                             type: string
 *                     slotCapacity:
 *                       type: object
 *                       description: How many people can share each slot type
 *                       properties:
 *                         full:
 *                           type: integer
 *                           description: 1 person per slot
 *                         half:
 *                           type: integer
 *                           description: 2 people per slot
 *                         quarter:
 *                           type: integer
 *                           description: 4 people per slot
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin or special member of this equb
 *       404:
 *         description: Equb not found
 *       500:
 *         description: Internal server error
 */
router.get('/:equbId/available-slot-numbers', 
  authenticateToken, 
  equbController.getAvailableSlotNumbers
);

module.exports = router; 
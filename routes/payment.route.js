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

// Payment history and summary (requires equb membership)
router.get('/:equbId/payment-history', isEqubMember, validatePaymentHistory, paymentController.getPaymentHistory);
router.get('/:equbId/unpaid-members', isEqubMember, validateUnpaidMembers, paymentController.getUnpaidMembers);
router.get('/:equbId/payment-summary', isEqubMember, paymentController.getPaymentSummary);

// Payment processing (requires collector or admin role)
router.post('/process-payment', isCollectorOrAdmin, validateProcessPayment, paymentController.processPayment);

// Payment management (requires collector or admin role)
router.put('/:paymentId/mark-unpaid', isCollectorOrAdmin, paymentController.markPaymentAsUnpaid);
router.put('/:paymentId/cancel', isCollectorOrAdmin, paymentController.cancelPayment);

module.exports = router; 
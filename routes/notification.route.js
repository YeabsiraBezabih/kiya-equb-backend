const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateGetNotifications } = require('../middleware/validation');

// Apply authentication to all notification routes
router.use(authenticateToken);

// Get notifications
router.get('/', validateGetNotifications, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notifications as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead);
router.put('/mark-all-read', notificationController.markAllNotificationsAsRead);

// Delete notifications
router.delete('/:notificationId', notificationController.deleteNotification);
router.delete('/', notificationController.deleteAllNotifications);

// Notification settings
router.get('/settings', notificationController.getNotificationSettings);
router.put('/settings', notificationController.updateNotificationSettings);

// Test notification
router.post('/test', notificationController.testNotification);

// Bulk actions
router.post('/bulk-actions', notificationController.bulkNotificationActions);

module.exports = router; 
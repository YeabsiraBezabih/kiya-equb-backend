const Notification = require('../models/Notification');

// Get Notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, read, page, limit } = req.query;

    const options = {
      type: type || 'all',
      read: read || 'all',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await Notification.getUserNotifications(userId, options);

    res.status(200).json({
      status: "success",
      data: {
        notifications: result.notifications.map(notification => ({
          notificationId: notification.notificationId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          equbId: notification.equbId,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          actionUrl: notification.actionUrl,
          priority: notification.priority,
          age: notification.age,
          status: notification.status
        })),
        unreadCount: result.unreadCount,
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/get-failed",
        message: "Failed to get notifications"
      }
    });
  }
};

// Mark Notification as Read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Find the notification
    const notification = await Notification.findOne({
      notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "notification/not-found",
          message: "Notification not found"
        }
      });
    }

    // Mark as read
    await notification.markAsRead();

    res.status(200).json({
      status: "success",
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/mark-read-failed",
        message: "Failed to mark notification as read"
      }
    });
  }
};

// Mark All Notifications as Read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Mark all notifications as read
    await Notification.markAllAsRead(userId);

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read"
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/mark-all-read-failed",
        message: "Failed to mark all notifications as read"
      }
    });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Find and delete the notification
    const notification = await Notification.findOneAndDelete({
      notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "notification/not-found",
          message: "Notification not found"
        }
      });
    }

    res.status(200).json({
      status: "success",
      message: "Notification deleted successfully"
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/delete-failed",
        message: "Failed to delete notification"
      }
    });
  }
};

// Delete All Notifications
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    // Build query
    const query = { userId };
    if (type && type !== 'all') {
      query.type = type;
    }

    // Delete notifications
    const result = await Notification.deleteMany(query);

    res.status(200).json({
      status: "success",
      message: `${result.deletedCount} notifications deleted successfully`
    });

  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/delete-all-failed",
        message: "Failed to delete notifications"
      }
    });
  }
};

// Get Notification Settings
const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;

    // In a real app, you would have a separate NotificationSettings model
    // For now, we'll return default settings
    const settings = {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      paymentReminders: true,
      equbUpdates: true,
      systemAnnouncements: true,
      marketingMessages: false,
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00"
      }
    };

    res.status(200).json({
      status: "success",
      data: settings
    });

  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/settings-failed",
        message: "Failed to get notification settings"
      }
    });
  }
};

// Update Notification Settings
const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      pushNotifications,
      emailNotifications,
      smsNotifications,
      paymentReminders,
      equbUpdates,
      systemAnnouncements,
      marketingMessages,
      quietHours
    } = req.body;

    // In a real app, you would save these settings to a database
    // For now, we'll just validate and return success

    // Validate quiet hours if provided
    if (quietHours && quietHours.enabled) {
      if (!quietHours.startTime || !quietHours.endTime) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "notification/invalid-quiet-hours",
            message: "Start time and end time are required when quiet hours are enabled"
          }
        });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(quietHours.startTime) || !timeRegex.test(quietHours.endTime)) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "notification/invalid-time-format",
            message: "Time must be in HH:MM format"
          }
        });
      }
    }

    // Create notification about settings update
    await Notification.createSystemNotification(userId, {
      title: 'Notification Settings Updated',
      message: 'Your notification preferences have been updated successfully',
      priority: 'low'
    });

    res.status(200).json({
      status: "success",
      message: "Notification settings updated successfully"
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/update-settings-failed",
        message: "Failed to update notification settings"
      }
    });
  }
};

// Test Notification
const testNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.body;

    // Create a test notification
    const notification = await Notification.createSystemNotification(userId, {
      title: 'Test Notification',
      message: `This is a test ${type || 'system'} notification to verify your settings`,
      priority: 'low'
    });

    res.status(200).json({
      status: "success",
      message: "Test notification sent successfully",
      data: {
        notificationId: notification.notificationId
      }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/test-failed",
        message: "Failed to send test notification"
      }
    });
  }
};

// Get Unread Count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    // Get unread count by type
    const unreadByType = await Notification.aggregate([
      { $match: { userId, isRead: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const unreadCounts = {
      total: unreadCount,
      byType: unreadByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.status(200).json({
      status: "success",
      data: unreadCounts
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/unread-count-failed",
        message: "Failed to get unread count"
      }
    });
  }
};

// Bulk Actions
const bulkNotificationActions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { action, notificationIds, type } = req.body;

    if (!action) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "notification/missing-action",
          message: "Action is required"
        }
      });
    }

    let query = { userId };
    
    // Filter by notification IDs if provided
    if (notificationIds && notificationIds.length > 0) {
      query.notificationId = { $in: notificationIds };
    }
    
    // Filter by type if provided
    if (type && type !== 'all') {
      query.type = type;
    }

    let result;
    let message;

    switch (action) {
      case 'mark-read':
        result = await Notification.updateMany(query, { isRead: true });
        message = `${result.modifiedCount} notifications marked as read`;
        break;
      
      case 'mark-unread':
        result = await Notification.updateMany(query, { isRead: false });
        message = `${result.modifiedCount} notifications marked as unread`;
        break;
      
      case 'delete':
        result = await Notification.deleteMany(query);
        message = `${result.deletedCount} notifications deleted`;
        break;
      
      default:
        return res.status(400).json({
          status: "error",
          error: {
            code: "notification/invalid-action",
            message: "Invalid action. Supported actions: mark-read, mark-unread, delete"
          }
        });
    }

    res.status(200).json({
      status: "success",
      message,
      data: {
        affectedCount: result.modifiedCount || result.deletedCount
      }
    });

  } catch (error) {
    console.error('Bulk notification actions error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "notification/bulk-actions-failed",
        message: "Failed to perform bulk actions"
      }
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  testNotification,
  getUnreadCount,
  bulkNotificationActions
}; 
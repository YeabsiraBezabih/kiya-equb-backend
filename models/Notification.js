const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['payment', 'equb', 'system', 'reminder', 'announcement'],
    default: 'system'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  equbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equb'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isPushed: {
    type: Boolean,
    default: false
  },
  isEmailed: {
    type: Boolean,
    default: false
  },
  isSMS: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionData: {
    type: mongoose.Schema.Types.Mixed
  },
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for notification status
notificationSchema.virtual('status').get(function() {
  if (this.isRead) return 'read';
  if (this.expiresAt && this.expiresAt < new Date()) return 'expired';
  return 'unread';
});

// Indexes
notificationSchema.index({ notificationId: 1 });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'userId': 1, 'isRead': 1 });
notificationSchema.index({ 'userId': 1, 'type': 1 });

// Method to generate notification ID
notificationSchema.statics.generateNotificationId = function() {
  return 'N' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

// Method to mark as pushed
notificationSchema.methods.markAsPushed = function() {
  this.isPushed = true;
  return this.save();
};

// Method to mark as emailed
notificationSchema.methods.markAsEmailed = function() {
  this.isEmailed = true;
  return this.save();
};

// Method to mark as SMS sent
notificationSchema.methods.markAsSMSSent = function() {
  this.isSMS = true;
  return this.save();
};

// Static method to create payment notification
notificationSchema.statics.createPaymentNotification = function(userId, equbId, paymentData) {
  return this.create({
    notificationId: this.generateNotificationId(),
    userId,
    type: 'payment',
    title: 'Payment Due',
    message: `Your payment of ${paymentData.amount} for Equb ${paymentData.equbName} is due on ${paymentData.dueDate}`,
    equbId,
    priority: 'high',
    actionUrl: `/equb/${equbId}/payment`,
    actionData: { paymentId: paymentData.paymentId }
  });
};

// Static method to create equb notification
notificationSchema.statics.createEqubNotification = function(userId, equbId, notificationData) {
  return this.create({
    notificationId: this.generateNotificationId(),
    userId,
    type: 'equb',
    title: notificationData.title,
    message: notificationData.message,
    equbId,
    priority: notificationData.priority || 'medium',
    actionUrl: notificationData.actionUrl,
    actionData: notificationData.actionData
  });
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = function(userId, notificationData) {
  return this.create({
    notificationId: this.generateNotificationId(),
    userId,
    type: 'system',
    title: notificationData.title,
    message: notificationData.message,
    priority: notificationData.priority || 'medium',
    actionUrl: notificationData.actionUrl,
    actionData: notificationData.actionData
  });
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const { type = 'all', read = 'all', page = 1, limit = 20 } = options;
  
  const query = { userId };
  
  if (type !== 'all') query.type = type;
  if (read !== 'all') query.isRead = read === 'true';
  
  const total = await this.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  
  const notifications = await this.find(query)
    .populate('equbId', 'name equbId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  const unreadCount = await this.countDocuments({ userId, isRead: false });
  
  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

// Static method to clean expired notifications
notificationSchema.statics.cleanExpired = async function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 
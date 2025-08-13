const authRoutes = require('../routes/auth.route');
const equbRoutes = require('../routes/equb.route');
const paymentRoutes = require('../routes/payment.route');
const profileRoutes = require('../routes/profile.route');
const notificationRoutes = require('../routes/notification.route');
const equbCreationRoutes = require('../routes/equb-creation.route');

module.exports = function(app) {
  // API Routes
  app.use('/api/mobile/auth', authRoutes);
  app.use('/api/mobile/equbs', equbRoutes);
  app.use('/api/mobile/payments', paymentRoutes);
  app.use('/api/mobile/profile', profileRoutes);
  app.use('/api/mobile/notifications', notificationRoutes);
  app.use('/api/mobile/equb-creation', equbCreationRoutes);

  // Landing page route
  app.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Welcome to Ekub App Backend API',
      version: require('../package.json').version,
      documentation: '/api/docs',
      health: '/health'
    });
  });

  // API documentation route
  app.get('/api/docs', (req, res) => {
    res.json({
      status: 'success',
      message: 'Ekub App API Documentation',
      endpoints: {
        authentication: {
          base: '/api/mobile/auth',
          endpoints: [
            'POST /signin - User sign in',
            'POST /signup - User sign up',
            'POST /refresh-token - Refresh access token',
            'POST /forgot-password - Request password reset',
            'POST /reset-password - Reset password',
            'POST /signout - User sign out',
            'PUT /change-password - Change password'
          ]
        },
                 equbs: {
           base: '/api/mobile/equbs',
           endpoints: [
             'GET /discover-equbs - Discover available equbs',
             'POST /join-equb - Join an equb',
             'POST /my-equbs - Get user\'s equbs',
             'GET /:equbId - Get equb details',
             'POST /:equbId/members - Add new member',
             'DELETE /:equbId/members/:userId - Remove member',
             'PUT /:equbId/members/:userId/role - Update member role'
           ]
         },
         equbCreation: {
           base: '/api/mobile/equb-creation',
           endpoints: [
             'POST /create - Create new Ekub',
             'GET /my-created - Get user\'s created Ekubs',
             'GET /:equbId - Get Ekub creation details'
           ]
         },
        payments: {
          base: '/api/mobile/payments',
          endpoints: [
            'GET /:equbId/payment-history - Get payment history',
            'POST /process-payment - Process payment',
            'GET /:equbId/unpaid-members - Get unpaid members',
            'GET /:equbId/payment-summary - Get payment summary',
            'PUT /:paymentId/mark-unpaid - Mark payment as unpaid',
            'PUT /:paymentId/cancel - Cancel payment'
          ]
        },
        profile: {
          base: '/api/mobile/profile',
          endpoints: [
            'GET / - Get user profile',
            'PUT / - Update user profile',
            'POST /profile-picture - Upload profile picture',
            'DELETE /profile-picture - Delete profile picture',
            'GET /statistics - Get user statistics',
            'POST /deactivate - Deactivate account',
            'POST /reactivate - Reactivate account'
          ]
        },
        notifications: {
          base: '/api/mobile/notifications',
          endpoints: [
            'GET / - Get notifications',
            'GET /unread-count - Get unread count',
            'PUT /:notificationId/read - Mark notification as read',
            'PUT /mark-all-read - Mark all notifications as read',
            'DELETE /:notificationId - Delete notification',
            'DELETE / - Delete all notifications',
            'GET /settings - Get notification settings',
            'PUT /settings - Update notification settings',
            'POST /test - Send test notification',
            'POST /bulk-actions - Perform bulk actions'
          ]
        }
      },
      authentication: 'All protected endpoints require JWT token in Authorization header: Bearer <token>',
             rateLimiting: {
         'Authentication endpoints': '5 requests per minute',
         'Payment endpoints': '10 requests per minute',
         'Equb creation endpoints': '3 requests per minute',
         'General endpoints': '60 requests per minute'
       }
    });
  });
};

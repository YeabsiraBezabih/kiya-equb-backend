const express = require('express');
const app = express();

console.log('🔍 Debugging Route Registration...');
console.log('============================================================');

try {
  // Test loading each route file
  console.log('\n1. Testing route file loading...');
  
  const landingRoutes = require('./routes/landing.route.js');
  console.log('✅ Landing routes loaded');
  
  const authRoutes = require('./routes/auth.route.js');
  console.log('✅ Auth routes loaded');
  
  const equbRoutes = require('./routes/equb.route.js');
  console.log('✅ Equb routes loaded');
  
  const paymentRoutes = require('./routes/payment.route.js');
  console.log('✅ Payment routes loaded');
  
  const profileRoutes = require('./routes/profile.route.js');
  console.log('✅ Profile routes loaded');
  
  const notificationRoutes = require('./routes/notification.route.js');
  console.log('✅ Notification routes loaded');
  
  const equbCreationRoutes = require('./routes/equb-creation.route.js');
  console.log('✅ Equb creation routes loaded');
  
  const userRoutes = require('./routes/user.route.js');
  console.log('✅ User routes loaded');
  
  const apiDocRoutes = require('./routes/api_documentation.route.js');
  console.log('✅ API doc routes loaded');
  
  console.log('\n2. Testing route registration...');
  
  // Register routes
  app.use('/', landingRoutes);
  console.log('✅ Landing routes registered');
  
  app.use('/api/mobile/auth', authRoutes);
  console.log('✅ Auth routes registered');
  
  app.use('/api/mobile/equbs', equbRoutes);
  console.log('✅ Equb routes registered');
  
  app.use('/api/mobile/payments', paymentRoutes);
  console.log('✅ Payment routes registered');
  
  app.use('/api/mobile/profile', profileRoutes);
  console.log('✅ Profile routes registered');
  
  app.use('/api/mobile/notifications', notificationRoutes);
  console.log('✅ Notification routes registered');
  
  app.use('/api/mobile/equb-creation', equbCreationRoutes);
  console.log('✅ Equb creation routes registered');
  
  app.use('/api/mobile/users', userRoutes);
  console.log('✅ User routes registered');
  
  app.use('/api/docs', apiDocRoutes);
  console.log('✅ API doc routes registered');
  
  console.log('\n3. Checking registered routes...');
  
  // Print all registered routes
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`📍 ${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`📍 Router mounted at: ${middleware.regexp}`);
    }
  });
  
  console.log('\n✅ All routes loaded and registered successfully!');
  
} catch (error) {
  console.error('❌ Error during route loading/registration:', error.message);
  console.error('Stack trace:', error.stack);
}

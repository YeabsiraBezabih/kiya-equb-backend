/**
 * Test MongoDB Logging Configuration
 * 
 * This script tests the MongoDB logging setup to ensure logs are being written to MongoDB Atlas
 */

const { logger } = require('./logger');

console.log('Testing MongoDB Logging...');
console.log('========================');

// Test different log levels
logger.info('This is an info message - testing MongoDB logging');
logger.warn('This is a warning message - testing MongoDB logging');
logger.error('This is an error message - testing MongoDB logging');

// Test with additional metadata
logger.info('User action logged', {
  userId: 'UABC123DEF',
  action: 'login',
  timestamp: new Date().toISOString(),
  ip: '192.168.1.1'
});

// Test error logging with stack trace
try {
  throw new Error('Test error for logging');
} catch (error) {
  logger.error('Caught test error', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

console.log('Logging test completed. Check your MongoDB Atlas database for logs.');
console.log('Database: ekub-logs');
console.log('Collection: logs (or as configured)');

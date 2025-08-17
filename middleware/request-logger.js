/**
 * Request Logging Middleware for Ekub Backend
 * Logs all HTTP requests with detailed information
 */

const logger = require('../logger').logger;

// Request logging middleware
const requestLogger = (req, res, next) => {
  // Capture request start time
  const startTime = Date.now();
  
  // Log request details
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? 'Bearer ***' : 'None',
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP')
    },
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id'] || generateRequestId()
  };

  // Log the incoming request
  logger.info('Incoming Request', requestLog);
  
  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log response details
    const responseLog = {
      timestamp: new Date().toISOString(),
      requestId: requestLog.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      responseSize: chunk ? chunk.length : 0,
      headers: res.getHeaders(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    // Log based on status code
    if (res.statusCode >= 400) {
      logger.error('Request Failed', responseLog);
    } else if (res.statusCode >= 300) {
      logger.warn('Request Redirected', responseLog);
    } else {
      logger.info('Request Completed', responseLog);
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Generate unique request ID
const generateRequestId = () => {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || generateRequestId(),
    method: req.method,
    url: req.originalUrl || req.url,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    body: req.body,
    query: req.query,
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? 'Bearer ***' : 'None'
    },
    ip: req.ip || req.connection.remoteAddress
  };
  
  logger.error('Request Error', errorLog);
  next(err);
};

// Console logging for development (more readable)
const consoleRequestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  console.log(`\n📥 ${new Date().toISOString()} - ${req.method} ${req.originalUrl || req.url}`);
  console.log(`   IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`   User-Agent: ${req.get('User-Agent')}`);
  
  if (Object.keys(req.body).length > 0) {
    console.log(`   Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log(`   Query: ${JSON.stringify(req.query, null, 2)}`);
  }
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode < 300 ? '✅' : res.statusCode < 400 ? '🔄' : '❌';
    
    console.log(`📤 ${statusColor} ${res.statusCode} ${res.statusMessage} - ${duration}ms`);
    
    if (res.statusCode >= 400 && chunk) {
      try {
        const responseBody = JSON.parse(chunk.toString());
        console.log(`   Error: ${JSON.stringify(responseBody, null, 2)}`);
      } catch (e) {
        console.log(`   Response: ${chunk.toString()}`);
      }
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  consoleRequestLogger
};

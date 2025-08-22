const winston = require("winston");
require('winston-mongodb');
const config = require('config');

// Get logging configuration
const logConfig = config.get('logging');

// Create transports array
const transports = [
  // Console transport for development/testing
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Create logger without MongoDB transport initially
const logger = winston.createLogger({
    level: logConfig.level || "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: "ekub-backend" },
    transports: transports,
    // Add error handling to prevent crashes
    exitOnError: false
});

// Function to add MongoDB transport after database connection
const addMongoDBTransport = () => {
  try {
    if (logConfig.mongodb && logConfig.mongodb.enabled && logConfig.mongodb.db) {
      // Validate MongoDB connection string
      if (logConfig.mongodb.db && logConfig.mongodb.db !== 'undefined') {
        // For logging, we'll use the same database but different collection
        // This ensures we don't have connection issues
        const mongoTransport = new winston.transports.MongoDB({ 
          db: logConfig.mongodb.db,
          options: { 
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 30000
          },
          collection: logConfig.mongodb.collection || 'logs',
          level: logConfig.mongodb.level || 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        });
        
        // Add error handling to the transport
        mongoTransport.on('error', (error) => {
          console.warn('MongoDB transport error:', error.message);
        });
        
        logger.add(mongoTransport);
        logger.info('MongoDB transport added to logger');
      }
    }
  } catch (error) {
    console.warn('Failed to add MongoDB transport:', error.message);
    // Don't crash the app if logging fails
  }
};

exports.logger = logger;
exports.addMongoDBTransport = addMongoDBTransport;
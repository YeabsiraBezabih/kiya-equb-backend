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

// Add MongoDB transport if enabled
if (logConfig.mongodb && logConfig.mongodb.enabled) {
  transports.push(
    new winston.transports.MongoDB({ 
      db: logConfig.mongodb.db,
      options: { 
        useUnifiedTopology: true,
        useNewUrlParser: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      },
      collection: logConfig.mongodb.collection || 'logs',
      level: logConfig.mongodb.level || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  );
}

const logger = winston.createLogger({
    level: logConfig.level || "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: "ekub-backend" },
    transports: transports,
  });

exports.logger = logger;
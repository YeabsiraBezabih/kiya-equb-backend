const winston = require("winston");
require('winston-mongodb');

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: "ekub-backend" },
    transports: [
      // Console transport for development/testing
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      // MongoDB transport for production logging
      new winston.transports.MongoDB({ 
        db: "mongodb+srv://yared:yared6996@cluster0.y6rza.mongodb.net/log",
        options: { useUnifiedTopology: true }
      })
    ],
  });

exports.logger = logger;
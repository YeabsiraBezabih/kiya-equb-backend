const winston = require("winston");
require('winston-mongodb');

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.MongoDB({ db: "mongodb+srv://yared:yared6996@cluster0.y6rza.mongodb.net/log" }),
    ],
  });

exports.logger = logger;
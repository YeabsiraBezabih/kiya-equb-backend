const mongoose = require("mongoose");
const { logger, addMongoDBTransport } = require("../logger");
const config = require("config");

module.exports = function () {
  const dbUrl = config.get("database.url");
  const dbName = config.has("database.name") ? config.get("database.name") : undefined;
  const dbOptions = config.has("database.options") ? config.get("database.options") : {};

  console.log("Connecting to MongoDB:", dbUrl, dbName ? `(db: ${dbName})` : "");
  mongoose
    .connect(dbUrl, {
      dbName,
      ...dbOptions,
    })
    .then(() => {
      try {
        logger.info(`Connected to MongoDB: ${dbUrl.split("@")[1] || dbUrl}`);
        logger.info(`Database: ${mongoose.connection.name}`);
      } catch (logError) {
        console.log(`Connected to MongoDB: ${dbUrl.split("@")[1] || dbUrl}`);
        console.log(`Database: ${mongoose.connection.name}`);
      }
      
      // Add MongoDB transport to logger after successful connection
      try {
        addMongoDBTransport();
      } catch (error) {
        console.warn('Failed to add MongoDB transport to logger:', error.message);
        // Continue without MongoDB logging transport
      }
    })
    .catch((err) => {
      console.log("Failed to connect to MongoDB:", dbUrl, err.message);
      logger.error("Failed to connect to MongoDB:", err.message);
      // Don't exit the process, let it continue and retry
      console.log("Will retry database connection...");
    });

  // Handle connection events
  mongoose.connection.on("error", (err) => {
    try {
      logger.error("MongoDB connection error:", err);
    } catch (logError) {
      console.error("MongoDB connection error:", err.message);
    }
  });

  mongoose.connection.on("disconnected", () => {
    try {
      logger.warn("MongoDB disconnected");
    } catch (logError) {
      console.warn("MongoDB disconnected");
    }
  });

  mongoose.connection.on("reconnected", () => {
    try {
      logger.info("MongoDB reconnected");
    } catch (logError) {
      console.info("MongoDB reconnected");
    }
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    try {
      if (mongoose.connection.readyState === 1) { // Connected
        await mongoose.connection.close();
        try {
          logger.info("MongoDB connection closed through app termination");
        } catch (logError) {
          console.log("MongoDB connection closed through app termination");
        }
      }
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error.message);
      process.exit(1);
    }
  });
};

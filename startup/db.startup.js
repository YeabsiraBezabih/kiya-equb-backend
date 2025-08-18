const mongoose = require("mongoose");
const { logger } = require("../logger");
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
      logger.info(`Connected to MongoDB: ${dbUrl.split("@")[1] || dbUrl}`);
      logger.info(`Database: ${mongoose.connection.name}`);
    })
    .catch((err) => {
      console.log("Failed to connect to MongoDB:", dbUrl, err.message);
      logger.error("Failed to connect to MongoDB:", err.message);
      process.exit(1);
    });

  // Handle connection events
  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed through app termination");
    process.exit(0);
  });
};

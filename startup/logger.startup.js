const { logger } = require("../logger");

module.exports = function () {
  try {
    // Set up process error handlers
    process.on("unhandledRejection", (ex) => {
      try {
        logger.error("Unhandled Rejection:", ex);
      } catch (logError) {
        console.error("Unhandled Rejection:", ex);
      }
    });
    
    process.on("uncaughtException", (ex) => {
      try {
        logger.error("Uncaught Exception:", ex);
      } catch (logError) {
        console.error("Uncaught Exception:", ex);
      }
      // Don't throw here as it would crash the app
    });
    
    logger.info("Logger startup completed successfully");
  } catch (error) {
    console.error("Logger startup error:", error.message);
    // Continue without logger - don't crash the app
  }
};

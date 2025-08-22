// Load environment variables first
try {
  require('dotenv').config();
} catch (error) {
  console.warn("⚠️  Failed to load .env file:", error.message);
  // Continue without .env file
}

let config;
try {
  config = require("config");
} catch (error) {
  console.error("❌ Failed to load config:", error.message);
  process.exit(1);
}

let express;
let morgan;

try {
  express = require("express");
} catch (error) {
  console.error("❌ Failed to load express:", error.message);
  process.exit(1);
}

try {
  morgan = require("morgan");
} catch (error) {
  console.error("❌ Failed to load morgan:", error.message);
  process.exit(1);
}

let app;
try {
  app = express();
} catch (error) {
  console.error("❌ Failed to create express app:", error.message);
  process.exit(1);
}

try {
  // Import startup modules
  require("./startup/prod.js")(app);
  require("./startup/db.startup.js")();
  require("./startup/logger.startup.js")();
  // API routes
  require("./startup/routes.startup")(app);
} catch (err) {
  console.error("Error during startup:", err);
  // Continue startup process even if some modules fail
}

// Logging middleware
try {
  const nodeEnv = (() => {
    try {
      return config.util.getEnv("NODE_ENV");
    } catch (error) {
      return "development";
    }
  })();
  
  if (nodeEnv !== "test") {
    app.use(morgan("combined"));
  }
} catch (error) {
  console.error("❌ Failed to load morgan logging middleware:", error.message);
  // Continue without morgan logging - don't crash the app
}



// Health check endpoint
app.get("/health", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Ekub App Backend is running",
      timestamp: new Date().toISOString(),
      environment: config.util.getEnv("NODE_ENV"),
      version: (() => {
        try {
          return require("./package.json").version;
        } catch (error) {
          return "unknown";
        }
      })(),
    });
  } catch (error) {
    console.error("Health check error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message
    });
  }
});



// 404 handler
app.use("*", (req, res) => {
  try {
    res.status(404).json({
      status: "error",
      error: {
        code: "not-found",
        message: "The requested resource was not found",
      },
    });
  } catch (error) {
    console.error("404 handler error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

// Error logging middleware
try {
  const { errorLogger } = require('./middleware/request-logger');
  app.use(errorLogger);
} catch (error) {
  console.error('❌ Failed to load error logging middleware:', error.message);
  // Continue without error logging - don't crash the app
}

// Use dynamic port configuration
let port;
let host;

try {
  port = config.get("server.port") || process.env.PORT || 3001;
  host = config.get("server.host") || "0.0.0.0";
} catch (error) {
  console.warn("⚠️  Failed to get config values, using defaults:", error.message);
  port = process.env.PORT || 3001;
  host = "0.0.0.0";
}

let server;

try {
  server = app.listen(port, host, () => {
    console.log(`🚀 Ekub App Backend is running on port ${port}`);
    console.log(`🌍 Environment: ${(() => {
      try {
        return config.util.getEnv("NODE_ENV");
      } catch (error) {
        return "development";
      }
    })() || "development"}`);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
  });
} catch (error) {
  console.error("❌ Failed to start server:", error.message);
  process.exit(1);
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

module.exports = app;

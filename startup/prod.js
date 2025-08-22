const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("config");

module.exports = function (app) {
  try {
    app.set('trust proxy', 1);

  // Security middleware
  try {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    );
  } catch (error) {
    console.error("❌ Failed to load helmet middleware:", error.message);
    // Continue without helmet - don't crash the app
  }

  // CORS configuration - allow all origins (while supporting credentials)
  // Note: Using a function here allows reflecting any Origin instead of '*',
  // which is required when credentials are enabled.
  try {
    app.use(
      cors({
        origin: (origin, callback) => callback(null, true),
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );
    // Enable preflight across-the-board
    app.options("*", cors());
  } catch (error) {
    console.error("❌ Failed to load CORS middleware:", error.message);
    // Continue without CORS - don't crash the app
  }

  // Compression middleware
  try {
    app.use(compression());
  } catch (error) {
    console.error("❌ Failed to load compression middleware:", error.message);
    // Continue without compression - don't crash the app
  }

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logging middleware
  try {
    const { consoleRequestLogger } = require('../middleware/request-logger');
    app.use(consoleRequestLogger);
    console.log('✅ Request logging middleware loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load request logging middleware:', error.message);
    // Continue without logging middleware - don't crash the app
  }

  // Rate limiting
  try {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        status: "error",
        error: {
          code: "rate-limit/exceeded",
          message: "Too many requests from this IP, please try again later.",
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use("/api/", limiter);
  } catch (error) {
    console.error("❌ Failed to load rate limiting middleware:", error.message);
    // Continue without rate limiting - don't crash the app
  }

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("Global error handler:", err);

    if (err.name === "ValidationError") {
      return res.status(422).json({
        status: "error",
        error: {
          code: "validation/error",
          message: "Validation failed",
          details: err.message,
        },
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/invalid-token",
          message: "Invalid token",
        },
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/token-expired",
          message: "Token expired",
        },
      });
    }

    // Default error
    let errorMessage;
    try {
      errorMessage = config.util.getEnv("NODE_ENV") === "production"
        ? "Internal server error"
        : err.message;
    } catch (configError) {
      errorMessage = "Internal server error";
    }
    
    res.status(err.status || 500).json({
      status: "error",
      error: {
        code: "server/internal-error",
        message: errorMessage,
      },
    });
  });
  } catch (error) {
    console.error("❌ Failed to load production middleware:", error.message);
    // Continue without production middleware - don't crash the app
  }
};

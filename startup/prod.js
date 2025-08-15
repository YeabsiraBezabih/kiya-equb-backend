const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("config");

module.exports = function (app) {
  // Security middleware
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

  // CORS configuration
  const corsOrigins = config.get("cors.origins");
  const allowedOrigins = Array.isArray(corsOrigins)
    ? corsOrigins
    : corsOrigins
    ? corsOrigins.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000", "http://localhost:3001"];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Rate limiting
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
    res.status(err.status || 500).json({
      status: "error",
      error: {
        code: "server/internal-error",
        message:
          config.util.getEnv("NODE_ENV") === "production"
            ? "Internal server error"
            : err.message,
      },
    });
  });
};

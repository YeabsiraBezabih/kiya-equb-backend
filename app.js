const config = require("config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

try{
// Import startup modules
require('./startup/prod.js')(app);
require("./startup/db.startup.js")();
require("./startup/logger.startup.js")();
}catch(err) {
  console.error("Error during startup:", err);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOrigins = config.get("cors.origins");
const allowedOrigins = Array.isArray(corsOrigins) 
  ? corsOrigins 
  : corsOrigins 
    ? corsOrigins.split(',').map(origin => origin.trim())
    : ["http://localhost:3000", "http://localhost:3001"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.util.getEnv("NODE_ENV") !== "test") {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    error: {
      code: "rate-limit/exceeded",
      message: "Too many requests from this IP, please try again later."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Ekub App Backend is running',
    timestamp: new Date().toISOString(),
    environment: config.util.getEnv("NODE_ENV"),
    version: require('./package.json').version
  });
});

// API routes
require("./startup/routes.startup")(app);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: "error",
    error: {
      code: "not-found",
      message: "The requested resource was not found"
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      status: "error",
      error: {
        code: "validation/error",
        message: "Validation failed",
        details: err.message
      }
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: "error",
      error: {
        code: "auth/invalid-token",
        message: "Invalid token"
      }
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: "error",
      error: {
        code: "auth/token-expired",
        message: "Token expired"
      }
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    status: "error",
    error: {
      code: "server/internal-error",
      message: config.util.getEnv("NODE_ENV") === "production" 
        ? "Internal server error" 
        : err.message
    }
  });
});

// Use dynamic port configuration
const port = config.get("server.port") || process.env.PORT || 3001;
const server = app.listen(port, config.get("server.host") || "0.0.0.0", () => {
  console.log(`🚀 Ekub App Backend is running on port ${port}`);
  console.log(`🌍 Environment: ${config.util.getEnv("NODE_ENV")}`);
  console.log(`🔗 Health check: ${config.get("database.url")}:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;

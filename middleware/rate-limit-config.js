/**
 * Rate Limiting Configuration for Ekub Backend
 * 
 * This file allows easy switching between different rate limit configurations
 * for production, development, and testing environments.
 */

const rateLimit = require("express-rate-limit");

// Production rate limits (strict)
const productionLimits = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/auth-exceeded",
        message: "Too many authentication attempts, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  payment: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/payment-exceeded",
        message: "Too many payment requests, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // 60 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/general-exceeded",
        message: "Too many requests, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Development rate limits (moderate)
const developmentLimits = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/auth-exceeded",
        message: "Too many authentication attempts, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  payment: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/payment-exceeded",
        message: "Too many payment requests, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/general-exceeded",
        message: "Too many requests, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Testing rate limits (very permissive)
const testingLimits = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/auth-exceeded",
        message: "Too many authentication attempts, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  payment: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/payment-exceeded",
        message: "Too many payment requests, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: {
      status: "error",
      error: {
        code: "rate-limit/general-exceeded",
        message: "Too many requests, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Function to get rate limits based on environment
const getRateLimits = (environment = 'development') => {
  let limits;
  
  switch (environment.toLowerCase()) {
    case 'production':
      limits = productionLimits;
      break;
    case 'testing':
      limits = testingLimits;
      break;
    case 'development':
    default:
      limits = developmentLimits;
      break;
  }
  
  return {
    authRateLimit: rateLimit(limits.auth),
    paymentRateLimit: rateLimit(limits.payment),
    generalRateLimit: rateLimit(limits.general)
  };
};

// Export the function and predefined configurations
module.exports = {
  getRateLimits,
  productionLimits,
  developmentLimits,
  testingLimits
};

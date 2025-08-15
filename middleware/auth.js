const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/no-token",
          message: "Access token is required",
        },
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.get("jwt.secret"));

    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/user-not-found",
          message: "User not found or inactive",
        },
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/invalid-token",
          message: "Invalid token",
        },
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/token-expired",
          message: "Token expired",
        },
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: "error",
      error: {
        code: "auth/verification-failed",
        message: "Token verification failed",
      },
    });
  }
};

// Middleware to check if user has specific role in an equb
const checkEqubRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { equbId } = req.params;
      const userId = req.user._id;

      // Find the equb and check user's role
      const Equb = require("../models/Equb");
      const equb = await Equb.findOne({ equbId });

      if (!equb) {
        return res.status(404).json({
          status: "error",
          error: {
            code: "equb/not-found",
            message: "Equb not found",
          },
        });
      }

      const member = equb.members.find(
        (m) => m.userId.toString() === userId.toString()
      );
      if (!member) {
        return res.status(403).json({
          status: "error",
          error: {
            code: "equb/not-member",
            message: "You are not a member of this equb",
          },
        });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          status: "error",
          error: {
            code: "equb/insufficient-permissions",
            message: "You don't have permission to perform this action",
          },
        });
      }

      req.equb = equb;
      req.member = member;
      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        status: "error",
        error: {
          code: "auth/role-check-failed",
          message: "Role verification failed",
        },
      });
    }
  };
};

// Middleware to check if user is equb admin
const isEqubAdmin = checkEqubRole(["admin","collector","judge","writer"]);

// Middleware to check if user is collector or admin
const isCollectorOrAdmin = checkEqubRole([
  "collector",
  "admin",
  "judge",
  "writer",
]);

// Middleware to check if user is member (any role)
const isEqubMember = checkEqubRole([
  "member",
  "collector",
  "judge",
  "writer",
  "admin",
]);

// Middleware to check if user owns the resource
const isOwner = (resourceField = "userId") => {
  return async (req, res, next) => {
    try {
      const resourceUserId =
        req.params[resourceField] || req.body[resourceField];

      if (!resourceUserId) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "validation/missing-field",
            message: `${resourceField} is required`,
          },
        });
      }

      if (resourceUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: "error",
          error: {
            code: "auth/not-owner",
            message: "You can only access your own resources",
          },
        });
      }

      next();
    } catch (error) {
      console.error("Owner check error:", error);
      return res.status(500).json({
        status: "error",
        error: {
          code: "auth/owner-check-failed",
          message: "Owner verification failed",
        },
      });
    }
  };
};

// Middleware to check if user is verified
const requireVerification = async (req, res, next) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "auth/not-verified",
          message: "Account verification required",
        },
      });
    }
    next();
  } catch (error) {
    console.error("Verification check error:", error);
    return res.status(500).json({
      status: "error",
      error: {
        code: "auth/verification-check-failed",
        message: "Verification check failed",
      },
    });
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: "error",
    error: {
      code: "rate-limit/auth-exceeded",
      message: "Too many authentication attempts, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for payment endpoints
const paymentRateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: "error",
    error: {
      code: "rate-limit/payment-exceeded",
      message: "Too many payment requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticateToken,
  checkEqubRole,
  isEqubAdmin,
  isCollectorOrAdmin,
  isEqubMember,
  isOwner,
  requireVerification,
  authRateLimit,
  paymentRateLimit,
};

const landingRoutes = require("../routes/landing.route");
const authRoutes = require("../routes/auth.route");
const equbRoutes = require("../routes/equb.route");
const paymentRoutes = require("../routes/payment.route");
const profileRoutes = require("../routes/profile.route");
const notificationRoutes = require("../routes/notification.route");
module.exports = function (app) {
  try {
    // API Routes
    app.use("/", landingRoutes);
    app.use("/api/mobile/auth", authRoutes);
    app.use("/api/mobile/equbs", equbRoutes);
    app.use("/api/mobile/payments", paymentRoutes);
    app.use("/api/mobile/profile", profileRoutes);
    app.use("/api/mobile/notifications", notificationRoutes);
    app.use("/api/mobile/users", require("../routes/user.route"));
    app.use("/api/docs", require("../routes/api_documentation.route"));
    
    console.log("✅ API routes loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load API routes:", error.message);
    // Continue without routes - don't crash the app
  }
};

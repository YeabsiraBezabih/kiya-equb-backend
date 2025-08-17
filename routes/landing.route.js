const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     tags: [Health]
 *     description: Get API welcome message and basic information
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Welcome to Ekub App Backend API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "/api/docs"
 *                 health:
 *                   type: string
 *                   example: "/health"
 */
router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to Ekub App Backend API",
    version: require("../package.json").version,
    documentation: "/api/docs",
    health: "/health",
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Check if the API is running and healthy
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Ekub App Backend is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-17T16:27:58.286Z"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Ekub App Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: require("../package.json").version,
  });
});

module.exports = router;

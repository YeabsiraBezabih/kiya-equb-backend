const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to Ekub App Backend API",
    version: require("../package.json").version,
    documentation: "/api/docs",
    health: "/health",
  });
});

module.exports = router;

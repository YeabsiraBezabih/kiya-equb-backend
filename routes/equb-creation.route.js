const express = require('express');
const router = express.Router();
const { authenticateToken, equbCreationRateLimit } = require('../middleware/auth');
const { validateEqubCreation } = require('../middleware/validation');
const equbCreationController = require('../controllers/equb-creation.controller');
const upload = require('../middleware/upload');

// Create new Ekub (with rate limiting)
router.post('/create', 
  authenticateToken, // Authentication first
  equbCreationRateLimit, // Then rate limiting
  upload.single('privacyPolicy'), 
  validateEqubCreation, 
  equbCreationController.createEqub
);

// Get user's created Ekubs
router.get('/my-created', 
  authenticateToken, 
  equbCreationController.getMyCreatedEqubs
);

// Get Ekub creation details
router.get('/:equbId', 
  authenticateToken, 
  equbCreationController.getEqubCreationDetails
);

module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateUpdateProfile } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply authentication to all profile routes
router.use(authenticateToken);

// Profile management
router.get('/', profileController.getUserProfile);
router.put('/', validateUpdateProfile, profileController.updateUserProfile);

// Profile picture management
router.post('/profile-picture', upload.single('profilePicture'), profileController.uploadProfilePicture);
router.delete('/profile-picture', profileController.deleteProfilePicture);

// User statistics
router.get('/statistics', profileController.getUserStatistics);

// Account management
router.post('/deactivate', profileController.deactivateAccount);
router.post('/reactivate', profileController.reactivateAccount);

module.exports = router; 
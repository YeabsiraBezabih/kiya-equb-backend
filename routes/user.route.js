const express = require('express');
const router = express.Router();
const { getUserById } = require('../controllers/user.controller');

// Public route to get user by mongoose _id (no auth)
router.get('/:id', getUserById);

module.exports = router;

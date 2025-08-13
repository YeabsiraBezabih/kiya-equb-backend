const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.send('Welcome to Ekub Landing Page!');
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// The full path is now defined here
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
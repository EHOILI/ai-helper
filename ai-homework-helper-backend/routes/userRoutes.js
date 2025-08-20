const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProgress } = require('../controllers/userController');

// The full path is now defined here
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/update-progress', updateUserProgress);

// POST /api/users/update-progress
router.post('/update-progress', userController.updateProgress);

module.exports = router;
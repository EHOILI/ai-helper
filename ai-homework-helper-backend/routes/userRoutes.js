const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProgress } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/update-progress', updateUserProgress);

module.exports = router;
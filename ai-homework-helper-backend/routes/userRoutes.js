const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProgress, equipTheme } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/update-progress', updateUserProgress);
router.post('/equip-theme', equipTheme);

module.exports = router;
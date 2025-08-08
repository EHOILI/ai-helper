
const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

router.get('/status', mainController.getRoot);

module.exports = router;

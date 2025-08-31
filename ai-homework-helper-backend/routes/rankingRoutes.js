const express = require('express');
const router = express.Router();
const { getSchoolRanking } = require('../controllers/rankingController');

router.get('/schools', getSchoolRanking);

module.exports = router;
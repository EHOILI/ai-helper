const express = require('express');
const router = express.Router();
const { getSchoolList } = require('../controllers/schoolController');

router.get('/', getSchoolList);

module.exports = router;
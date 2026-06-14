const express = require('express');
const { getProgressStats } = require('../controllers/progressController');

const router = express.Router();

router.get('/:studentId', getProgressStats);

module.exports = router;

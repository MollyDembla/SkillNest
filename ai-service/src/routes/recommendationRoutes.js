const express = require('express');
const { getForStudent } = require('../controllers/recommendationController');

const router = express.Router();

router.get('/:studentId', getForStudent);

module.exports = router;

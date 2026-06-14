const express = require('express');
const { getRecommendations, checkAiHealth } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/health', protect, checkAiHealth);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;

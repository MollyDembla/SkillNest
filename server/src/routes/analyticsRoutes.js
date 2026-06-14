const express = require('express');
const { getInstructorAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/instructor', protect, restrictTo('instructor'), getInstructorAnalytics);

module.exports = router;

const express = require('express');
const { getCourseReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/course/:courseId', getCourseReviews);
router.post('/course/:courseId', protect, restrictTo('student'), createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;

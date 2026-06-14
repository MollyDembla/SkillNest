const express = require('express');
const { getCourseProgress, markLessonComplete } = require('../controllers/progressController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:courseId', getCourseProgress);
router.post('/:courseId/lessons/:lessonId/complete', markLessonComplete);

module.exports = router;

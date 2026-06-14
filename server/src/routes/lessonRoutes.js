const express = require('express');
const { getLessons, addLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/course/:courseId', getLessons);

router.post('/course/:courseId', protect, restrictTo('instructor'), addLesson);
router.put('/:lessonId', protect, restrictTo('instructor'), updateLesson);
router.delete('/:lessonId', protect, restrictTo('instructor'), deleteLesson);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const courseController = require('../controllers/courseController');

router.get('/', courseController.listCourses);
router.get('/:courseId', courseController.getCourseById);

router.post('/', protect, restrictTo('instructor', 'admin'), courseController.createCourse);
router.put('/:courseId', protect, restrictTo('instructor', 'admin'), courseController.updateCourse);
router.delete('/:courseId', protect, restrictTo('instructor', 'admin'), courseController.deleteCourse);

module.exports = router;
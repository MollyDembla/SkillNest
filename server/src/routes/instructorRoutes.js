const express = require('express');
const { getDashboard, getInstructorCourses, getInstructorCourse } = require('../controllers/instructorController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('instructor'));

router.get('/dashboard', getDashboard);
router.get('/courses', getInstructorCourses);
router.get('/courses/:courseId', getInstructorCourse);

module.exports = router;

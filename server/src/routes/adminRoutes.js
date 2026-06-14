const express = require('express');
const {
  getDashboard, getAdminCourses, getAdminUsers,
  updateUserRole, deleteAdminUser,
  approveCourse, rejectCourse, getPlatformAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getPlatformAnalytics);
router.get('/courses', getAdminCourses);
router.patch('/courses/:courseId/approve', approveCourse);
router.patch('/courses/:courseId/reject', rejectCourse);
router.get('/users', getAdminUsers);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteAdminUser);

module.exports = router;

const express = require('express');
const { getDashboard, getAdminCourses, getAdminUsers, updateUserRole, deleteAdminUser } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getDashboard);
router.get('/courses', getAdminCourses);
router.get('/users', getAdminUsers);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteAdminUser);

module.exports = router;

const express = require('express');
const { getMyEnrollments, checkEnrollment } = require('../controllers/enrollmentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyEnrollments);
router.get('/check/:courseId', checkEnrollment);

module.exports = router;

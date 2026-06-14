const express = require('express');
const { getMyEnrollments, checkEnrollment, getMyCertificates, getCertificateForCourse } = require('../controllers/enrollmentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyEnrollments);
router.get('/check/:courseId', checkEnrollment);
router.get('/certificates', getMyCertificates);
router.get('/certificates/:courseId', getCertificateForCourse);

module.exports = router;

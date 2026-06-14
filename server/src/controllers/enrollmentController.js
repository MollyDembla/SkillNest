const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id, status: { $ne: 'refunded' } })
    .populate({ path: 'course', select: 'title slug thumbnail averageRating reviewsCount price', populate: { path: 'instructor', select: 'name' } })
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { enrollments }, 'Enrollments retrieved.'));
});

const checkEnrollment = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  if (!courseId) return next(new ApiError(400, 'courseId parameter is required.'));

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });

  res.status(200).json(
    new ApiResponse(200, { isEnrolled: !!enrollment, enrollment }, 'Enrollment status checked.')
  );
});

const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id })
    .populate('course', 'title thumbnail slug instructor')
    .sort({ issueDate: -1 });

  res.status(200).json(new ApiResponse(200, { certificates }, 'Certificates retrieved.'));
});

const getCertificateForCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const certificate = await Certificate.findOne({ student: req.user._id, course: courseId })
    .populate('course', 'title thumbnail instructor')
    .populate('student', 'name avatar');

  if (!certificate) return next(new ApiError(404, 'Certificate not found. Complete the course to earn it.'));

  res.status(200).json(new ApiResponse(200, { certificate }, 'Certificate retrieved.'));
});

module.exports = { getMyEnrollments, checkEnrollment, getMyCertificates, getCertificateForCourse };

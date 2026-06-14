const Enrollment = require('../models/Enrollment');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id, status: 'active' })
    .populate({ path: 'course', select: 'title slug thumbnail averageRating reviewsCount price', populate: { path: 'instructor', select: 'name' } })
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { enrollments }, 'Enrollments retrieved.'));
});

const checkEnrollment = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!courseId) {
    return next(new ApiError(400, 'courseId parameter is required.'));
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });

  res.status(200).json(
    new ApiResponse(200, { isEnrolled: !!enrollment, enrollment }, 'Enrollment status checked.')
  );
});

module.exports = { getMyEnrollments, checkEnrollment };

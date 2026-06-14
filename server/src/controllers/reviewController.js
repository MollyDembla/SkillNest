const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getCourseReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('student', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(new ApiResponse(200, { reviews }, 'Reviews retrieved.'));
});

const createReview = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new ApiError(400, 'Rating must be between 1 and 5.'));
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });
  if (!enrollment) {
    return next(new ApiError(403, 'You must be enrolled in this course to leave a review.'));
  }

  const existing = await Review.findOne({ student: req.user._id, course: courseId });
  if (existing) {
    return next(new ApiError(400, 'You have already reviewed this course.'));
  }

  const review = await Review.create({
    course: courseId,
    student: req.user._id,
    rating,
    comment: comment?.trim() || '',
  });

  await review.populate('student', 'name avatar');

  res.status(201).json(new ApiResponse(201, { review }, 'Review submitted.'));
});

const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return next(new ApiError(404, 'Review not found.'));

  const isOwner = review.student.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return next(new ApiError(403, 'You are not allowed to delete this review.'));
  }

  await review.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Review deleted.'));
});

module.exports = { getCourseReviews, createReview, deleteReview };

const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const coursePopulate = {
  path: 'course',
  select: 'title slug thumbnail price averageRating',
  populate: { path: 'instructor', select: 'name' },
};

const getDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const [enrollments, payments] = await Promise.all([
    Enrollment.find({ student: studentId })
      .populate(coursePopulate)
      .sort({ updatedAt: -1 }),
    Payment.find({ user: studentId, status: 'succeeded' }).select('amount createdAt'),
  ]);

  const total = enrollments.length;
  const completed = enrollments.filter(
    (e) => e.status === 'completed' || e.progressPercentage >= 100
  ).length;
  const inProgress = enrollments.filter(
    (e) => e.progressPercentage > 0 && e.progressPercentage < 100 && e.status === 'active'
  ).length;
  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Courses with progress > 0 and not yet completed, sorted by most recently updated
  const continueLearning = enrollments
    .filter((e) => e.progressPercentage > 0 && e.progressPercentage < 100 && e.status === 'active')
    .slice(0, 3);

  // If nothing in progress, fall back to recently enrolled but not started
  const startNext =
    continueLearning.length === 0
      ? enrollments.filter((e) => e.progressPercentage === 0 && e.status === 'active').slice(0, 3)
      : [];

  const recentEnrollments = enrollments.slice(0, 4);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: { total, inProgress, completed, totalSpent },
        continueLearning,
        startNext,
        recentEnrollments,
      },
      'Dashboard data retrieved.'
    )
  );
});

module.exports = { getDashboard };

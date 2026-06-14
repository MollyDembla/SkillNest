const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

const getDashboard = asyncHandler(async (req, res) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    userCounts,
    courseCounts,
    totalEnrollments,
    revenueAgg,
    revenueMonthAgg,
    revenueByDayAgg,
    pendingCourses,
    recentUsers,
  ] = await Promise.all([
    // User counts grouped by role
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),

    // Course counts grouped by status
    Course.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),

    // Total active enrollments
    Enrollment.countDocuments({ status: { $ne: 'refunded' } }),

    // All-time revenue
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // Revenue this month
    Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // Revenue per day for last 7 days
    Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Pending courses awaiting approval (newest first, limit 5)
    Course.find({ status: 'pending' })
      .select('title thumbnail category level price createdAt instructor')
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5),

    // Most recent registrations (limit 6)
    User.find()
      .select('name email role createdAt isEmailVerified')
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  // Map user counts
  const roleMap = {};
  for (const r of userCounts) roleMap[r._id] = r.count;
  const students = roleMap.student || 0;
  const instructors = roleMap.instructor || 0;
  const admins = roleMap.admin || 0;
  const totalUsers = students + instructors + admins;

  // Map course counts
  const courseMap = {};
  for (const c of courseCounts) courseMap[c._id] = c.count;
  const totalCourses = Object.values(courseMap).reduce((s, n) => s + n, 0);

  const stats = {
    totalUsers,
    students,
    instructors,
    totalCourses,
    publishedCourses: courseMap.published || 0,
    pendingCourses: courseMap.pending || 0,
    draftCourses: courseMap.draft || 0,
    rejectedCourses: courseMap.rejected || 0,
    totalEnrollments,
    totalRevenue: parseFloat((revenueAgg[0]?.total || 0).toFixed(2)),
    revenueThisMonth: parseFloat((revenueMonthAgg[0]?.total || 0).toFixed(2)),
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats,
        pendingCourses,
        recentUsers,
        revenueByDay: revenueByDayAgg.map((r) => ({
          date: r._id,
          amount: parseFloat(r.amount.toFixed(2)),
        })),
      },
      'Admin dashboard data retrieved.'
    )
  );
});

const getAdminCourses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 50);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status && req.query.status !== 'all') {
    filter.status = req.query.status;
  }
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { category: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      courses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, 'Courses retrieved.')
  );
});

const getAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 50);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role && req.query.role !== 'all') {
    filter.role = req.query.role;
  }
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total, courseCountsAgg, enrollmentCountsAgg] = await Promise.all([
    User.find(filter)
      .select('name email role avatar isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
    // Course count per instructor
    Course.aggregate([
      { $group: { _id: '$instructor', count: { $sum: 1 } } },
    ]),
    // Enrollment count per student
    Enrollment.aggregate([
      { $match: { status: { $ne: 'refunded' } } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]),
  ]);

  const courseMap = {};
  for (const r of courseCountsAgg) courseMap[r._id.toString()] = r.count;

  const enrollmentMap = {};
  for (const r of enrollmentCountsAgg) enrollmentMap[r._id.toString()] = r.count;

  const usersWithStats = users.map((u) => ({
    ...u.toObject(),
    courseCount: courseMap[u._id.toString()] || 0,
    enrollmentCount: enrollmentMap[u._id.toString()] || 0,
  }));

  res.status(200).json(
    new ApiResponse(200, {
      users: usersWithStats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, 'Users retrieved.')
  );
});

const updateUserRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['student', 'instructor', 'admin'].includes(role)) {
    return next(new ApiError(400, 'Invalid role. Must be student, instructor, or admin.'));
  }

  if (userId === req.user._id.toString()) {
    return next(new ApiError(400, 'You cannot change your own role.'));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, select: 'name email role isEmailVerified createdAt' }
  );

  if (!user) return next(new ApiError(404, 'User not found.'));

  res.status(200).json(new ApiResponse(200, { user }, `Role updated to ${role}.`));
});

const deleteAdminUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    return next(new ApiError(400, 'You cannot delete your own account.'));
  }

  const user = await User.findById(userId);
  if (!user) return next(new ApiError(404, 'User not found.'));

  await user.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully.'));
});

const approveCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).populate('instructor', '_id name');
  if (!course) return next(new ApiError(404, 'Course not found.'));
  if (course.status === 'published') return next(new ApiError(400, 'Course is already published.'));

  course.status = 'published';
  course.rejectionReason = '';
  await course.save();

  const io = req.app.get('io');
  await createNotification(
    io,
    course.instructor._id,
    'course_status',
    `Your course "${course.title}" has been approved and is now live!`,
    `/instructor/courses`
  );

  res.status(200).json(new ApiResponse(200, { course }, 'Course approved and published.'));
});

const rejectCourse = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) return next(new ApiError(400, 'A rejection reason is required.'));

  const course = await Course.findById(req.params.courseId).populate('instructor', '_id name');
  if (!course) return next(new ApiError(404, 'Course not found.'));

  course.status = 'rejected';
  course.rejectionReason = reason.trim();
  await course.save();

  const io = req.app.get('io');
  await createNotification(
    io,
    course.instructor._id,
    'course_status',
    `Your course "${course.title}" was rejected. Reason: ${reason.trim()}`,
    `/instructor/courses`
  );

  res.status(200).json(new ApiResponse(200, { course }, 'Course rejected.'));
});

const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalUsers, totalCourses, totalEnrollments, revenueAgg,
    revenueByDayAgg, enrollmentsByDayAgg, topCourses,
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Enrollment.countDocuments({ status: { $ne: 'refunded' } }),
    Payment.aggregate([{ $match: { status: 'succeeded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
    Enrollment.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Course.find({ status: 'published' })
      .populate('instructor', 'name')
      .sort({ reviewsCount: -1, averageRating: -1 })
      .limit(10)
      .select('title thumbnail averageRating reviewsCount price instructor'),
  ]);

  res.status(200).json(new ApiResponse(200, {
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenue: parseFloat((revenueAgg[0]?.total || 0).toFixed(2)),
    revenueByDay: revenueByDayAgg.map((r) => ({ date: r._id, amount: parseFloat(r.amount.toFixed(2)) })),
    enrollmentsByDay: enrollmentsByDayAgg.map((r) => ({ date: r._id, count: r.count })),
    topCourses,
  }, 'Platform analytics retrieved.'));
});

module.exports = { getDashboard, getAdminCourses, getAdminUsers, updateUserRole, deleteAdminUser, approveCourse, rejectCourse, getPlatformAnalytics };

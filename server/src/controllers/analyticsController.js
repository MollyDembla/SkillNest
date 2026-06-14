const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getInstructorAnalytics = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const courses = await Course.find({ instructor: instructorId })
    .select('_id title thumbnail price status averageRating reviewsCount createdAt');

  if (courses.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { empty: true, stats: null }, 'No courses yet.')
    );
  }

  const courseIds = courses.map((c) => c._id);

  const [
    enrollAgg,
    enrollByDayAgg,
    payments,
    reviewAgg,
    recentEnrollments,
    uniqueStudents,
  ] = await Promise.all([
    // Enrollments per course with completed count
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds }, status: { $ne: 'refunded' } } },
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]),

    // Enrollments by day — last 30 days
    Enrollment.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'refunded' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Succeeded payments that include any of the instructor's courses
    Payment.find({
      courseIds: { $in: courseIds },
      status: 'succeeded',
    }).select('amount courseIds createdAt'),

    // Review count grouped by star rating
    Review.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),

    // Most recent 8 enrollments
    Enrollment.find({ course: { $in: courseIds }, status: { $ne: 'refunded' } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('student', 'name avatar')
      .populate('course', 'title thumbnail'),

    // Distinct students across all courses
    Enrollment.distinct('student', {
      course: { $in: courseIds },
      status: { $ne: 'refunded' },
    }),
  ]);

  // ── Revenue attribution (proportional by course count in payment) ──
  let totalRevenue = 0;
  const revByDayMap = {};

  payments.forEach((p) => {
    const instructorCount = p.courseIds.filter((id) =>
      courseIds.some((cid) => cid.toString() === id.toString())
    ).length;
    if (!instructorCount) return;

    const share = (instructorCount / p.courseIds.length) * p.amount;
    totalRevenue += share;

    const day = p.createdAt.toISOString().split('T')[0];
    revByDayMap[day] = (revByDayMap[day] || 0) + share;
  });

  // ── Fill 30-day time series (zeros for missing days) ──
  const enrollByDayMap = {};
  enrollByDayAgg.forEach((e) => { enrollByDayMap[e._id] = e.count; });

  const enrollmentsByDay = [];
  const revenueByDay = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    enrollmentsByDay.push({ date: key, count: enrollByDayMap[key] || 0 });
    revenueByDay.push({ date: key, amount: parseFloat((revByDayMap[key] || 0).toFixed(2)) });
  }

  // ── Rating summary ──
  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatingSum = 0;
  let totalReviews = 0;
  reviewAgg.forEach((r) => {
    ratingDist[r._id] = r.count;
    totalRatingSum += r._id * r.count;
    totalReviews += r.count;
  });
  const avgRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

  // ── Aggregate stats ──
  const enrollMap = {};
  enrollAgg.forEach((e) => { enrollMap[e._id.toString()] = e; });

  const totalEnrollments = enrollAgg.reduce((s, e) => s + e.count, 0);
  const totalCompleted = enrollAgg.reduce((s, e) => s + e.completed, 0);

  // ── Per-course breakdown ──
  const courseBreakdown = courses
    .map((c) => {
      const e = enrollMap[c._id.toString()] || { count: 0, completed: 0 };
      // Revenue for this specific course
      let courseRevenue = 0;
      payments.forEach((p) => {
        const hasThisCourse = p.courseIds.some((id) => id.toString() === c._id.toString());
        if (hasThisCourse) {
          courseRevenue += p.amount / p.courseIds.length;
        }
      });

      return {
        _id: c._id,
        title: c.title,
        thumbnail: c.thumbnail,
        status: c.status,
        price: c.price,
        enrollments: e.count,
        completed: e.completed,
        completionRate: e.count > 0 ? Math.round((e.completed / e.count) * 100) : 0,
        revenue: parseFloat(courseRevenue.toFixed(2)),
        averageRating: c.averageRating,
        reviewsCount: c.reviewsCount,
      };
    })
    .sort((a, b) => b.enrollments - a.enrollments);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalEnrollments,
          totalStudents: uniqueStudents.length,
          totalCompleted,
          completionRate:
            totalEnrollments > 0
              ? Math.round((totalCompleted / totalEnrollments) * 100)
              : 0,
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews,
          totalCourses: courses.length,
          publishedCourses: courses.filter((c) => c.status === 'published').length,
        },
        enrollmentsByDay,
        revenueByDay,
        ratingDistribution: ratingDist,
        courseBreakdown,
        recentEnrollments,
      },
      'Analytics retrieved.'
    )
  );
});

module.exports = { getInstructorAnalytics };

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const courses = await Course.find({ instructor: instructorId })
    .select('title slug thumbnail status price averageRating reviewsCount createdAt')
    .sort({ createdAt: -1 });

  const courseIds = courses.map((c) => c._id);

  if (courseIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats: {
            totalCourses: 0,
            publishedCourses: 0,
            draftCourses: 0,
            pendingCourses: 0,
            totalStudents: 0,
            totalRevenue: 0,
            averageRating: 0,
          },
          courses: [],
          recentEnrollments: [],
        },
        'Instructor dashboard data retrieved.'
      )
    );
  }

  // Enrollment counts + unique students per course
  const enrollmentAgg = await Enrollment.aggregate([
    { $match: { course: { $in: courseIds }, status: { $ne: 'refunded' } } },
    {
      $group: {
        _id: '$course',
        enrollmentCount: { $sum: 1 },
        studentIds: { $addToSet: '$student' },
      },
    },
  ]);

  const enrollmentMap = {};
  const allStudentIds = new Set();
  for (const row of enrollmentAgg) {
    enrollmentMap[row._id.toString()] = row.enrollmentCount;
    row.studentIds.forEach((id) => allStudentIds.add(id.toString()));
  }

  const coursesWithStats = courses.map((course) => {
    const count = enrollmentMap[course._id.toString()] || 0;
    return {
      ...course.toObject(),
      enrollmentCount: count,
      revenue: parseFloat((count * (course.price || 0)).toFixed(2)),
    };
  });

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === 'published').length;
  const draftCourses = courses.filter((c) => c.status === 'draft').length;
  const pendingCourses = courses.filter((c) => c.status === 'pending').length;
  const totalStudents = allStudentIds.size;
  const totalRevenue = parseFloat(
    coursesWithStats.reduce((sum, c) => sum + c.revenue, 0).toFixed(2)
  );

  // Weighted average rating across all courses
  const ratedCourses = courses.filter((c) => c.reviewsCount > 0);
  const averageRating =
    ratedCourses.length > 0
      ? Math.round(
          (ratedCourses.reduce((s, c) => s + c.averageRating * c.reviewsCount, 0) /
            ratedCourses.reduce((s, c) => s + c.reviewsCount, 0)) *
            10
        ) / 10
      : 0;

  const recentEnrollments = await Enrollment.find({
    course: { $in: courseIds },
    status: { $ne: 'refunded' },
  })
    .populate('student', 'name email avatar')
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 })
    .limit(6);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalCourses,
          publishedCourses,
          draftCourses,
          pendingCourses,
          totalStudents,
          totalRevenue,
          averageRating,
        },
        courses: coursesWithStats,
        recentEnrollments,
      },
      'Instructor dashboard data retrieved.'
    )
  );
});

const getInstructorCourses = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const { status, search, sort } = req.query;

  const filter = { instructor: instructorId };
  if (status && status !== 'all') filter.status = status;
  if (search) filter.title = { $regex: search.trim(), $options: 'i' };

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    enrollments: null, // handled after aggregation
    revenue: null,
  };
  const mongoSort = sortMap[sort] || { createdAt: -1 };

  const courses = await Course.find(filter)
    .select('title slug thumbnail status price averageRating reviewsCount createdAt subtitle category level rejectionReason')
    .sort(mongoSort || { createdAt: -1 });

  const courseIds = courses.map((c) => c._id);

  const [enrollmentCounts, lessonCounts] = await Promise.all([
    courseIds.length > 0
      ? Enrollment.aggregate([
          { $match: { course: { $in: courseIds }, status: { $ne: 'refunded' } } },
          { $group: { _id: '$course', count: { $sum: 1 } } },
        ])
      : [],
    courseIds.length > 0
      ? Lesson.aggregate([
          { $match: { course: { $in: courseIds } } },
          { $group: { _id: '$course', count: { $sum: 1 } } },
        ])
      : [],
  ]);

  const countMap = {};
  for (const row of enrollmentCounts) countMap[row._id.toString()] = row.count;

  const lessonMap = {};
  for (const row of lessonCounts) lessonMap[row._id.toString()] = row.count;

  let result = courses.map((c) => ({
    ...c.toObject(),
    enrollmentCount: countMap[c._id.toString()] || 0,
    lessonCount: lessonMap[c._id.toString()] || 0,
    revenue: parseFloat(((countMap[c._id.toString()] || 0) * (c.price || 0)).toFixed(2)),
  }));

  if (sort === 'enrollments') result.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
  if (sort === 'revenue') result.sort((a, b) => b.revenue - a.revenue);

  res.status(200).json(
    new ApiResponse(200, { courses: result }, 'Instructor courses retrieved.')
  );
});

const getInstructorCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select(
    'title subtitle description category level price estimatedDuration thumbnail previewVideoUrl status rejectionReason instructor createdAt'
  );
  if (!course) return next(new ApiError(404, 'Course not found.'));
  if (course.instructor.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Access denied. You do not own this course.'));
  }

  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
  res.status(200).json(new ApiResponse(200, { course, lessons }, 'Course retrieved.'));
});

module.exports = { getDashboard, getInstructorCourses, getInstructorCourse };

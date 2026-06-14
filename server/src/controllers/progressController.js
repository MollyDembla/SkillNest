const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateCertificate } = require('../services/certificateService');
const { createNotification } = require('../services/notificationService');

const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const [progress, enrollment] = await Promise.all([
    Progress.findOne({ student: req.user._id, course: courseId }),
    Enrollment.findOne({ student: req.user._id, course: courseId }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      completedLessons: progress?.completedLessons?.map((id) => id.toString()) || [],
      progressPercentage: enrollment?.progressPercentage || 0,
      currentLesson: enrollment?.currentLesson?.toString() || null,
      status: enrollment?.status || 'active',
    }, 'Progress retrieved.')
  );
});

const markLessonComplete = asyncHandler(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrollment) return next(new ApiError(403, 'You are not enrolled in this course.'));

  const totalLessons = await Lesson.countDocuments({ course: courseId });

  const progress = await Progress.findOneAndUpdate(
    { student: req.user._id, course: courseId },
    {
      $addToSet: { completedLessons: lessonId },
      $setOnInsert: { student: req.user._id, course: courseId },
    },
    { upsert: true, new: true }
  );

  const completedCount = progress.completedLessons.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  enrollment.progressPercentage = percentage;
  enrollment.currentLesson = lessonId;

  let certificateId = null;
  if (percentage >= 100 && enrollment.status !== 'completed') {
    enrollment.status = 'completed';
    enrollment.completionDate = new Date();

    const [student, course] = await Promise.all([
      User.findById(req.user._id).select('name'),
      Course.findById(courseId).select('title'),
    ]);

    if (student && course) {
      const cert = await generateCertificate(student, course);
      certificateId = cert._id;

      const io = req.app.get('io');
      await createNotification(
        io,
        req.user._id,
        'system',
        `Congratulations! You completed "${course.title}". Your certificate is ready.`,
        `/certificate/${courseId}`
      );
    }
  }

  await enrollment.save();

  res.status(200).json(
    new ApiResponse(200, {
      completedLessons: progress.completedLessons.map((id) => id.toString()),
      progressPercentage: percentage,
      isCompleted: percentage >= 100,
      certificateId,
    }, 'Lesson marked as complete.')
  );
});

module.exports = { getCourseProgress, markLessonComplete };

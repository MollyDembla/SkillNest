const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const ownerCheck = async (lessonId, userId, next) => {
  const lesson = await Lesson.findById(lessonId).populate('course', 'instructor');
  if (!lesson) { next(new ApiError(404, 'Lesson not found.')); return null; }
  if (lesson.course.instructor.toString() !== userId.toString()) {
    next(new ApiError(403, 'You do not own this course.')); return null;
  }
  return lesson;
};

const getLessons = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select('status instructor');
  if (!course) return next(new ApiError(404, 'Course not found.'));

  const isOwner =
    req.user && course.instructor.toString() === req.user._id.toString();
  const isAdmin = req.user && req.user.role === 'admin';

  if (course.status !== 'published' && !isOwner && !isAdmin) {
    return next(new ApiError(403, 'This course is not publicly available.'));
  }

  const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });
  res.status(200).json(new ApiResponse(200, { lessons }, 'Lessons retrieved.'));
});

const addLesson = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId).select('instructor');
  if (!course) return next(new ApiError(404, 'Course not found.'));
  if (course.instructor.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'You do not own this course.'));
  }

  const last = await Lesson.findOne({ course: req.params.courseId }).sort({ order: -1 });
  const order = last ? last.order + 1 : 1;

  const lesson = await Lesson.create({
    course: req.params.courseId,
    order,
    title: req.body.title,
    description: req.body.description || '',
    videoUrl: req.body.videoUrl || '',
    videoDuration: req.body.videoDuration || 0,
    isPreview: req.body.isPreview || false,
    resources: req.body.resources || [],
  });

  res.status(201).json(new ApiResponse(201, { lesson }, 'Lesson added.'));
});

const updateLesson = asyncHandler(async (req, res, next) => {
  const lesson = await ownerCheck(req.params.lessonId, req.user._id, next);
  if (!lesson) return;

  const allowed = ['title', 'description', 'videoUrl', 'videoDuration', 'isPreview', 'order', 'resources'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) lesson[f] = req.body[f]; });
  await lesson.save();

  res.status(200).json(new ApiResponse(200, { lesson }, 'Lesson updated.'));
});

const deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await ownerCheck(req.params.lessonId, req.user._id, next);
  if (!lesson) return;
  await lesson.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Lesson deleted.'));
});

module.exports = { getLessons, addLesson, updateLesson, deleteLesson };

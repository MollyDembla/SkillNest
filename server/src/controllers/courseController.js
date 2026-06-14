const mongoose = require('mongoose');
const Course = require('../models/Course');
require('../models/Lesson');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const buildCourseQuery = (query) => {
	const filter = { status: 'published' };

	if (query.category) {
		filter.category = query.category;
	}

	if (query.level) {
		filter.level = query.level;
	}

	if (query.instructor && mongoose.Types.ObjectId.isValid(query.instructor)) {
		filter.instructor = query.instructor;
	}

	if (query.search) {
		filter.$or = [
			{ title: { $regex: query.search, $options: 'i' } },
			{ subtitle: { $regex: query.search, $options: 'i' } },
			{ description: { $regex: query.search, $options: 'i' } }
		];
	}

	return filter;
};

const listCourses = asyncHandler(async (req, res) => {
	const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
	const skip = (page - 1) * limit;

	const filter = buildCourseQuery(req.query);
	const sortBy = req.query.sort === 'price_asc'
		? { price: 1 }
		: req.query.sort === 'price_desc'
			? { price: -1 }
			: req.query.sort === 'rating'
				? { averageRating: -1, reviewsCount: -1 }
				: { createdAt: -1 };

	const [courses, total] = await Promise.all([
		Course.find(filter)
			.populate('instructor', 'name avatar bio')
			.sort(sortBy)
			.skip(skip)
			.limit(limit),
		Course.countDocuments(filter)
	]);

	res.status(200).json(
		new ApiResponse(200, {
			courses,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit)
			}
		}, 'Courses retrieved successfully.')
	);
});

const getCourseById = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.courseId)
		.populate('instructor', 'name avatar bio role')
		.populate('lessons');

	if (!course) {
		return next(new ApiError(404, 'Course not found.'));
	}

	if (course.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
		return next(new ApiError(404, 'Course not found.'));
	}

	res.status(200).json(new ApiResponse(200, { course }, 'Course retrieved successfully.'));
});

const createCourse = asyncHandler(async (req, res, next) => {
	if (!req.user || req.user.role !== 'instructor') {
		return next(new ApiError(403, 'Only instructors can create courses.'));
	}

	const course = await Course.create({
		...req.body,
		instructor: req.user._id,
		status: req.body.status || 'draft'
	});

	const populatedCourse = await course.populate('instructor', 'name avatar bio role');

	res.status(201).json(
		new ApiResponse(201, { course: populatedCourse }, 'Course created successfully.')
	);
});

const updateCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.courseId);

	if (!course) {
		return next(new ApiError(404, 'Course not found.'));
	}

	if (!req.user || (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString())) {
		return next(new ApiError(403, 'You are not allowed to update this course.'));
	}

	Object.assign(course, req.body);
	await course.save();

	const populatedCourse = await course.populate('instructor', 'name avatar bio role');

	res.status(200).json(
		new ApiResponse(200, { course: populatedCourse }, 'Course updated successfully.')
	);
});

const deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.courseId);

	if (!course) {
		return next(new ApiError(404, 'Course not found.'));
	}

	if (!req.user || (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString())) {
		return next(new ApiError(403, 'You are not allowed to delete this course.'));
	}

	await course.deleteOne();

	res.status(200).json(new ApiResponse(200, null, 'Course deleted successfully.'));
});

module.exports = {
	listCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse
};

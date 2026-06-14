const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const SAFE_SELECT = '-password -verificationToken -verificationTokenExpire -resetPasswordToken -resetPasswordExpire';

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(SAFE_SELECT);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile retrieved.'));
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const allowed = ['name', 'bio', 'avatar'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) return next(new ApiError(400, 'No valid fields to update.'));

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    .select(SAFE_SELECT);

  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated.'));
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return next(new ApiError(400, 'currentPassword and newPassword are required.'));
  if (newPassword.length < 6) return next(new ApiError(400, 'New password must be at least 6 characters.'));

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) return next(new ApiError(401, 'Current password is incorrect.'));

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully.'));
});

const getPublicProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('name avatar bio role createdAt');
  if (!user) return next(new ApiError(404, 'User not found.'));

  let extra = {};
  if (user.role === 'instructor') {
    const [courses, totalStudents] = await Promise.all([
      Course.find({ instructor: user._id, status: 'published' })
        .select('title thumbnail averageRating reviewsCount price slug')
        .sort({ createdAt: -1 })
        .limit(6),
      Enrollment.countDocuments({ course: { $in: await Course.find({ instructor: user._id }).select('_id') } }),
    ]);
    extra = { courses, totalStudents };
  }

  res.status(200).json(new ApiResponse(200, { user, ...extra }, 'Public profile retrieved.'));
});

module.exports = { getProfile, updateProfile, changePassword, getPublicProfile };

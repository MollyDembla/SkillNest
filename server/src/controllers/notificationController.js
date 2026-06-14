const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      unreadCount,
    }, 'Notifications retrieved.')
  );
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.status(200).json(new ApiResponse(200, { unreadCount: count }, 'Unread count retrieved.'));
});

const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) return next(new ApiError(404, 'Notification not found.'));
  notification.isRead = true;
  await notification.save();
  res.status(200).json(new ApiResponse(200, { notification }, 'Marked as read.'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read.'));
});

const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notification) return next(new ApiError(404, 'Notification not found.'));
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted.'));
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };

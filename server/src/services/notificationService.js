const Notification = require('../models/Notification');

const createNotification = async (io, userId, type, message, link = '') => {
  try {
    const notification = await Notification.create({ user: userId, type, message, link });
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }
    return notification;
  } catch (err) {
    console.error('createNotification error:', err.message);
  }
};

module.exports = { createNotification };

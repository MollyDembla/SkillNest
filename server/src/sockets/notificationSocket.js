module.exports = (io, socket) => {
  // Placeholder for notification socket events
  socket.on('subscribe_notifications', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} subscribed to notifications for user_${userId}`);
  });
};

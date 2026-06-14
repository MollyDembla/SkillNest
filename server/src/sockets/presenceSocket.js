module.exports = (io, socket) => {
  // Placeholder for user presence socket events
  socket.on('user_online', (userId) => {
    socket.userId = userId;
    console.log(`User ${userId} is online`);
    io.emit('user_status_changed', { userId, status: 'online' });
  });
};

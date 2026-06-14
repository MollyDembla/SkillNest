module.exports = (io, socket) => {
  // Placeholder for chat socket events
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
};

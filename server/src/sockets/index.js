const chatSocket = require('./chatSocket');
const notificationSocket = require('./notificationSocket');
const presenceSocket = require('./presenceSocket');

/**
 * Initialize all socket handlers
 * @param {object} io - Socket.io server instance
 */
const initSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connection established: ${socket.id}`);

    // Register modular socket handlers
    chatSocket(io, socket);
    notificationSocket(io, socket);
    presenceSocket(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket connection terminated: ${socket.id}`);
      if (socket.userId) {
        io.emit('user_status_changed', { userId: socket.userId, status: 'offline' });
      }
    });
  });
};

module.exports = {
  initSockets
};

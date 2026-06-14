const jwt = require('jsonwebtoken');
const config = require('../config/env');
const chatSocket = require('./chatSocket');
const notificationSocket = require('./notificationSocket');
const presenceSocket = require('./presenceSocket');

const initSockets = (io) => {
  // ── Socket auth middleware ────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    chatSocket(io, socket);
    notificationSocket(io, socket);
    presenceSocket(io, socket);

    socket.on('disconnect', () => {
      if (socket.userId) {
        io.emit('user_status_changed', { userId: socket.userId, status: 'offline' });
      }
    });
  });
};

module.exports = { initSockets };

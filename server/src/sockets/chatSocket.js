const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

// In-memory presence: userId → Set of socketIds
// Survives across reconnects; safe for single-process deployments.
const onlineUsers = new Map();

module.exports = (io, socket) => {
  const userId = socket.userId;

  // ── Presence: track this socket ──────────────────────────
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  // Join personal notification room
  socket.join(`user_${userId}`);

  // Broadcast online status
  io.emit('user_status_changed', { userId, status: 'online' });

  // ── join_room ─────────────────────────────────────────────
  socket.on('join_room', async (roomId) => {
    socket.join(roomId);

    try {
      // Mark all messages in this room (not from self) as read
      await Message.updateMany(
        {
          chatRoom: roomId,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
        { $addToSet: { readBy: userId } }
      );

      // Tell the other side their messages were read
      socket.to(roomId).emit('messages_read', { roomId, readerId: userId });
    } catch (err) {
      console.error('join_room read error:', err.message);
    }
  });

  // ── leave_room ────────────────────────────────────────────
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });

  // ── send_message ──────────────────────────────────────────
  socket.on('send_message', async ({ roomId, text }) => {
    if (!text?.trim()) return;

    try {
      const room = await ChatRoom.findById(roomId);
      if (!room) return socket.emit('message_error', { error: 'Room not found.' });

      const isParticipant = room.participants.some(
        (p) => p.toString() === userId.toString()
      );
      if (!isParticipant) return socket.emit('message_error', { error: 'Not a participant.' });

      const msg = await Message.create({
        chatRoom: roomId,
        sender: userId,
        text: text.trim(),
        readBy: [userId],
      });

      await msg.populate('sender', 'name avatar');

      // Update room's lastMessage timestamp
      await ChatRoom.findByIdAndUpdate(roomId, {
        lastMessage: msg._id,
        updatedAt: new Date(),
      });

      // Emit the new message to everyone currently in the room
      io.to(roomId).emit('new_message', msg);

      // Notify offline participants via their personal room
      room.participants.forEach((participantId) => {
        if (participantId.toString() !== userId.toString()) {
          io.to(`user_${participantId}`).emit('new_unread', {
            roomId,
            message: msg,
          });
        }
      });
    } catch (err) {
      console.error('send_message error:', err.message);
      socket.emit('message_error', { error: 'Failed to send message.' });
    }
  });

  // ── typing indicators ─────────────────────────────────────
  socket.on('typing', ({ roomId }) => {
    socket.to(roomId).emit('user_typing', { roomId, userId });
  });

  socket.on('stop_typing', ({ roomId }) => {
    socket.to(roomId).emit('user_stop_typing', { roomId, userId });
  });

  // ── disconnect: clean up presence ─────────────────────────
  socket.on('disconnect', () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit('user_status_changed', { userId, status: 'offline' });
      }
    }
  });
};

// Exported so REST controllers can check online status if needed
module.exports.isOnline = (userId) => onlineUsers.has(userId?.toString());

const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /chat/rooms
const getRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({ participants: req.user._id })
    .populate('participants', 'name avatar role')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name' },
    })
    .sort({ updatedAt: -1 });

  // Attach per-room unread count
  const enriched = await Promise.all(
    rooms.map(async (room) => {
      const unread = await Message.countDocuments({
        chatRoom: room._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      });
      return { ...room.toObject(), unread };
    })
  );

  res.status(200).json(new ApiResponse(200, { rooms: enriched }, 'Rooms retrieved.'));
});

// POST /chat/rooms  body: { participantId }
const getOrCreateRoom = asyncHandler(async (req, res, next) => {
  const { participantId } = req.body;
  if (!participantId) return next(new ApiError(400, 'participantId is required.'));
  if (participantId === req.user._id.toString())
    return next(new ApiError(400, 'Cannot chat with yourself.'));

  const other = await User.findById(participantId).select('name avatar role');
  if (!other) return next(new ApiError(404, 'User not found.'));

  // Find or return existing one-to-one room
  const existing = await ChatRoom.findOne({
    type: 'one-to-one',
    participants: { $all: [req.user._id, participantId], $size: 2 },
  })
    .populate('participants', 'name avatar role')
    .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } });

  if (existing) {
    return res.status(200).json(new ApiResponse(200, { room: existing }, 'Room found.'));
  }

  const room = await ChatRoom.create({
    participants: [req.user._id, participantId],
    type: 'one-to-one',
  });
  await room.populate('participants', 'name avatar role');

  res.status(201).json(new ApiResponse(201, { room }, 'Room created.'));
});

// GET /chat/rooms/:roomId/messages?page=1&limit=40
const getMessages = asyncHandler(async (req, res, next) => {
  const room = await ChatRoom.findById(req.params.roomId);
  if (!room) return next(new ApiError(404, 'Room not found.'));

  const isParticipant = room.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) return next(new ApiError(403, 'Not a participant of this room.'));

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ chatRoom: req.params.roomId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ chatRoom: req.params.roomId }),
  ]);

  // Mark unread messages as read via REST (socket also does this on join_room)
  await Message.updateMany(
    {
      chatRoom: req.params.roomId,
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    },
    { $addToSet: { readBy: req.user._id } }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        messages: messages.reverse(), // chronological for display
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      },
      'Messages retrieved.'
    )
  );
});

// GET /chat/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({ participants: req.user._id }).select('_id');
  const roomIds = rooms.map((r) => r._id);

  const count = await Message.countDocuments({
    chatRoom: { $in: roomIds },
    sender: { $ne: req.user._id },
    readBy: { $ne: req.user._id },
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount: count }, 'Unread count retrieved.')
  );
});

module.exports = { getRooms, getOrCreateRoom, getMessages, getUnreadCount };

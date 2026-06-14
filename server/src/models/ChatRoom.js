const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    type: {
      type: String,
      enum: ['one-to-one', 'group'],
      default: 'one-to-one'
    },
    groupName: {
      type: String,
      trim: true,
      default: ''
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  {
    timestamps: true
  }
);

// Index to search for rooms containing participants efficiently
chatRoomSchema.index({ participants: 1 });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;

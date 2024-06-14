const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention', 'message', 'post', 'other'], // Notification types
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

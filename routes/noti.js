const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: String,  // 'follow', 'like', 'comment', etc.
  userId: String,  // action perform wala user
  postId: String,  // post id on which like or commented
  isRead: { 
    type: Boolean, 
    default: false 
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
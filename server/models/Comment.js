const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String, required: true } // You may want to store the user who commented
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

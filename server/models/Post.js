const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: Buffer, required: true },
  caption: { type: String, required: true},
  likes: { type: Number, require: true},
  createdAt: { type: Date, default: Date.now },
  contentType: { type: String, required: true },
  userId: { type: String, required: true }
});

const Post = mongoose.model('Post', postSchema, 'photos');

module.exports = Post;
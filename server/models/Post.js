const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  image: Buffer,
  contentType: String,
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    text: String,
    author: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model('Post', postSchema, 'photos');

module.exports = Post;
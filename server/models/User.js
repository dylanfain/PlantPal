const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  following: [{
    type: String,  // Store Firebase UIDs of followed users
    ref: 'User'
  }],
  followers: [{
    type: String,  // Store Firebase UIDs of followers
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 
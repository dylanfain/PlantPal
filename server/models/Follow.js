const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: String,
    required: true
  },
  following: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow; 
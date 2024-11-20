const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');

// Follow a user
router.post('/:userId', auth, async (req, res) => {
  try {
    const newFollow = new Follow({
      follower: req.user.uid,
      following: req.params.userId
    });
    await newFollow.save();
    res.status(201).json({ message: 'Successfully followed user' });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Already following this user' });
    }
    res.status(500).json({ message: 'Error following user' });
  }
});

// Unfollow a user
router.delete('/:userId', auth, async (req, res) => {
  try {
    await Follow.findOneAndDelete({
      follower: req.user.uid,
      following: req.params.userId
    });
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

// Get following list
router.get('/following', auth, async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.user.uid });
    res.json(following.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching following list' });
  }
});

// Get followers list
router.get('/followers', auth, async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.user.uid });
    res.json(followers.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followers list' });
  }
});

module.exports = router; 
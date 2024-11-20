const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const User = require('./models/User');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//connection to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connected to:', process.env.MONGODB_URI);
  })
  .catch((err) => console.error('MongoDB connection error:', err));

//requests all posts in DB - not used yet/working
// app.get('/api/posts', (req, res) => {
//   const { userId } = req.query;
//   if (userId) {
//     // Fetch posts based on userId
//     res.json({ posts: [] }); // Sample response
//   } else {
//     res.status(400).json({ error: 'User ID is required' });
//   }
// });

//creates a plant post from a user - Works!
app.post('/api/posts', upload.single('image'), async (req, res) => {  
  console.log("Creating new post");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file); 

  const { title, caption, userId } = req.body;

  if (!title || !caption || !userId) {
      console.log("Missing required fields:", { title, caption, userId });
      return res.status(400).json({ error: 'Title, caption, and userId are required' });
  }

  try {
      let imageData = null;
      let contentType = null;

      if (req.file) {
          imageData = req.file.buffer;
          contentType = req.file.mimetype;
      } else if (req.body.image && req.body.image.startsWith('http')) {
          console.log('Fetching image from URL:', req.body.image);
          const response = await fetch(req.body.image);
          imageData = await response.buffer();
          contentType = response.headers.get('content-type');
          console.log('Image fetched successfully');
      }

      const newPost = new Post({
          title,
          image: imageData,
          caption,
          likes: 0,
          contentType: contentType || 'image/jpeg',
          userId,
          createdAt: new Date()
      });

      console.log("Attempting to save post to database");
      const savedPost = await newPost.save();
      console.log("Post saved successfully with ID:", savedPost._id);
      console.log("Post details:", {
          title: savedPost.title,
          userId: savedPost.userId,
          hasImage: !!savedPost.image
      });

      // Convert image buffer to base64 for response
      const postResponse = savedPost.toObject();
      if (postResponse.image) {
          postResponse.image = postResponse.image.toString('base64');
      }

      res.status(201).json(postResponse);
  } catch (error) {
      console.error('Failed to create post: ', error);
      res.status(400).json({ error: 'Failed to create post: ' + error.message });
  }
});


// retrieves all posts from a specific user - Works!
app.get('/api/posts/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });

    // Convert the binary image data to a base64 string for each post
    const postsWithBase64Images = posts.map((post) => {
      if (post.image && post.image.buffer) {
        // Convert the binary data (ArrayBuffer) to a Buffer and then to Base64
        const base64Image = Buffer.from(post.image.buffer).toString('base64');
        return {
          ...post._doc,
          image: base64Image, // Use the Base64 string
        };
      }
      return post;
    });

    res.json(postsWithBase64Images);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});


// Route to comment on a post - NOT WORKING YET
app.post('/api/posts/:id/comment', async (req, res) => {
  const { id } = req.params; // Post ID
  const { text, author } = req.body; // Comment text and author ID

  try {
    // Create a new comment
    const newComment = await Comment.create({ text, author });

    // Find the post and add the comment to it
    const post = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: newComment._id } },
      { new: true }
    ).populate('comments');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Comment added successfully', post });
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment', details: error.message });
  }
});

// Create or update user
app.post('/api/users', async (req, res) => {
  const { firebaseId, email } = req.body;
  try {
    let user = await User.findOne({ firebaseId });
    if (!user) {
      user = new User({ firebaseId, email });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Follow a user
app.post('/api/users/follow', async (req, res) => {
  const { followerId, followingId } = req.body;
  try {
    // Add to follower's following list
    await User.findOneAndUpdate(
      { firebaseId: followerId },
      { $addToSet: { following: followingId } }
    );
    
    // Add to following's followers list
    await User.findOneAndUpdate(
      { firebaseId: followingId },
      { $addToSet: { followers: followerId } }
    );
    
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ error: 'Error following user' });
  }
});

// Unfollow a user
app.post('/api/users/unfollow', async (req, res) => {
  const { followerId, followingId } = req.body;
  try {
    // Remove from follower's following list
    await User.findOneAndUpdate(
      { firebaseId: followerId },
      { $pull: { following: followingId } }
    );
    
    // Remove from following's followers list
    await User.findOneAndUpdate(
      { firebaseId: followingId },
      { $pull: { followers: followerId } }
    );
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ error: 'Error unfollowing user' });
  }
});

// Update the feed endpoint to be more efficient
app.get('/api/feed/:userId', async (req, res) => {
  try {
    console.log('\n=== FEED REQUEST START ===');
    const userId = req.params.userId;
    
    console.log('1. Request received for userId:', userId);

    // Find user and their following list
    const user = await User.findOne({ firebaseId: userId }).lean();
    console.log('2. User search result:', user ? {
      id: user._id,
      following: user.following || []
    } : 'Not found');
    
    if (!user) {
      return res.json({ posts: [], totalPages: 0, currentPage: 1 });
    }

    // Get posts only from followed users and self
    const postsQuery = {
      userId: { $in: [...(user.following || []), userId] }
    };

    // Get only the 2 most recent posts
    const posts = await Post.find(postsQuery)
      .sort({ createdAt: -1 })  // Sort by newest first
      .limit(2)  // Only get 2 posts
      .lean();

    console.log(`4. Found ${posts.length} posts`);

    // Process posts
    const processedPosts = posts.map(post => {
      try {
        if (post.image) {
          post.image = post.image.toString('base64');
          console.log(`Processed image for post: ${post.title}`);
        }
        return post;
      } catch (error) {
        console.error(`Error processing post ${post._id}:`, error);
        return { ...post, image: null };
      }
    });

    console.log('5. Successfully processed posts');
    res.json({
      posts: processedPosts,
      totalPages: 1,  // Since we're only showing 2 posts
      currentPage: 1
    });
    console.log('=== FEED REQUEST END ===\n');
  } catch (error) {
    console.error('Feed endpoint error:', {
      name: error.name,
      message: error.message
    });
    res.status(500).json({ 
      error: 'Error fetching feed', 
      details: error.message 
    });
  }
});

// Get user's following list
app.get('/api/users/:userId/following', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching following list' });
  }
});

// Add this debug endpoint right after your existing routes
app.get('/api/debug/status', (req, res) => {
  try {
    res.json({
      server: 'running',
      port: port,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      database: mongoose.connection.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this debug endpoint for cleaning up the database
app.post('/api/debug/cleanup', async (req, res) => {
  try {
    // Delete all posts
    await Post.deleteMany({});
    console.log('All posts deleted');

    // Delete all users except the current one
    await User.deleteMany({});
    console.log('All users deleted');

    res.json({ message: 'Database cleaned up successfully' });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to clean up database' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
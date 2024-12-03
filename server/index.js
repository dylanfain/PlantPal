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
const port = 5050;

app.use(cors({
    origin: ['http://localhost:5050'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//connection to database
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check posts collection
    const posts = await Post.find({});
    console.log('Number of posts in database:', posts.length);
    if (posts.length > 0) {
        console.log('Sample post:', posts[0]);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

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
    try {
        console.log('\n=== CREATE POST REQUEST ===');
        const { title, caption, userId } = req.body;
        
        // Get user's email
        const user = await User.findOne({ firebaseId: userId });
        console.log('1. Found user:', {
            firebaseId: user?.firebaseId,
            email: user?.email
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const post = new Post({
            title,
            caption,
            userId: user.firebaseId,
            userEmail: user.email,
            image: req.file ? req.file.buffer : null,
            contentType: req.file ? req.file.mimetype : null,
            likes: 0
        });

        await post.save();
        console.log('2. Created post:', {
            title: post.title,
            userId: post.userId,
            userEmail: post.userEmail
        });

        res.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Error creating post' });
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
        console.log('\n=== CREATE USER START ===');
        console.log('1. Creating user:', { firebaseId, email });
        
        let user = await User.findOne({ firebaseId });
        console.log('2. Existing user:', user);
        
        if (!user) {
            user = new User({
                firebaseId,
                email,  // Make sure email is included
                following: []
            });
            await user.save();
            console.log('3. New user created:', user);
        } else if (!user.email && email) {
            // Update existing user with email if missing
            user.email = email;
            await user.save();
            console.log('3. Updated existing user with email:', user);
        }
        
        console.log('=== CREATE USER END ===\n');
        res.json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Move the discover users endpoint BEFORE the :userId route
app.get('/api/users/discover/:userId', async (req, res) => {
    try {
        console.log('\n=== DISCOVER USERS DEBUG ===');
        console.log('1. Current user ID:', req.params.userId);
        
        // Get all users
        const allUsers = await User.find({});
        console.log('2. All users in database:', allUsers);
        
        // Get users except current user
        const discoverableUsers = await User.find({ 
            firebaseId: { $ne: req.params.userId }
        });
        
        console.log('3. Discoverable users:', discoverableUsers);
        console.log('4. Number of discoverable users:', discoverableUsers.length);
        
        // Log each discoverable user
        discoverableUsers.forEach((user, index) => {
            console.log(`5. User ${index + 1}:`, {
                firebaseId: user.firebaseId,
                email: user.email,
                following: user.following
            });
        });
        
        console.log('=== DISCOVER USERS DEBUG END ===\n');
        
        res.json(discoverableUsers);
    } catch (error) {
        console.log('ERROR in discover users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Add follow/unfollow endpoints
app.post('/api/users/follow', async (req, res) => {
    try {
        console.log('\n=== FOLLOW REQUEST ===');
        const { followerId, followingId } = req.body;
        console.log('1. Request:', { followerId, followingId });
        
        // Find both users
        const follower = await User.findOne({ firebaseId: followerId });
        const following = await User.findOne({ firebaseId: followingId });
        
        if (!follower || !following) {
            return res.status(404).json({ error: 'One or both users not found' });
        }
        
        // Add to following list
        if (!follower.following.includes(followingId)) {
            follower.following.push(followingId);
            await follower.save();
        }
        
        // Add to followers list
        if (!following.followers.includes(followerId)) {
            following.followers.push(followerId);
            await following.save();
        }
        
        res.json({ 
            message: 'Successfully followed user',
            following: follower.following,
            followers: following.followers
        });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ error: error.message || 'Error following user' });
    }
});

app.post('/api/users/unfollow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;
        const user = await User.findOne({ firebaseId: followerId });
        
        if (user) {
            user.following = user.following.filter(id => id !== followingId);
            await user.save();
        }
        
        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ error: 'Error unfollowing user' });
    }
});

// Then the general user routes
app.get('/api/users/:userId/following', async (req, res) => {
    try {
        console.log('\n=== FOLLOWING REQUEST START ===');
        console.log('1. Fetching following list for user:', req.params.userId);
        
        const user = await User.findOne({ firebaseId: req.params.userId });
        console.log('2. Found user:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('3. Creating new user');
            const newUser = new User({
                firebaseId: req.params.userId,
                following: []
            });
            await newUser.save();
            console.log('4. New user created');
            return res.json([]);
        }
        
        console.log('3. User following list:', user.following || []);
        console.log('=== FOLLOWING REQUEST END ===\n');
        
        res.json(user.following || []);
    } catch (error) {
        console.error('ERROR in following endpoint:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error fetching following list' });
    }
});

// Update the feed endpoint to be more efficient
app.get('/api/feed/:userId', async (req, res) => {
    try {
        console.log('\n=== FEED REQUEST START ===');
        console.log('1. Current user:', req.params.userId);
        
        // Get user's following list
        const user = await User.findOne({ firebaseId: req.params.userId });
        console.log('2. User details:', {
            email: user?.email,
            following: user?.following
        });
        
        // Get posts only from followed users
        const allPosts = await Post.find({});
        console.log('3. All posts:', allPosts.map(p => ({
            id: p._id,
            title: p.title,
            userId: p.userId,
            createdAt: p.createdAt
        })));
        
        // Filter posts to only show from followed users
        const filteredPosts = allPosts.filter(post => {
            console.log('Checking post:', {
                postUserId: post.userId,
                following: user?.following,
                isIncluded: user?.following.includes(post.userId)
            });
            return user?.following.includes(post.userId);
        });

        console.log('4. Filtered posts:', filteredPosts.map(p => ({
            id: p._id,
            title: p.title,
            userId: p.userId,
            createdAt: p.createdAt
        })));
        
        // Convert images for filtered posts
        const postsWithImages = filteredPosts.map(post => {
            if (post.image && post.image.buffer) {
                const base64Image = Buffer.from(post.image.buffer).toString('base64');
                return {
                    ...post._doc,
                    image: base64Image,
                };
            }
            return post;
        });

        console.log('5. Number of posts being sent:', postsWithImages.length);
        console.log('=== FEED REQUEST END ===\n');

        res.json({ posts: postsWithImages });
    } catch (error) {
        console.error('Error in feed endpoint:', error);
        res.status(500).json({ error: 'Error fetching feed' });
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

// Add this debug endpoint to see raw posts data
app.get('/api/debug/raw-posts', async (req, res) => {
    try {
        const posts = await Post.find({});
        res.json({
            count: posts.length,
            posts: posts.map(post => ({
                id: post._id,
                title: post.title,
                caption: post.caption,
                hasImage: !!post.image,
                contentType: post.contentType
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this debug endpoint to create test users
app.post('/api/debug/create-test-users', async (req, res) => {
    try {
        const testUsers = [
            {
                firebaseId: 'test-user-1',
                email: 'testuser1@example.com',
                following: []
            },
            {
                firebaseId: 'test-user-2',
                email: 'testuser2@example.com',
                following: []
            },
            {
                firebaseId: 'test-user-3',
                email: 'testuser3@example.com',
                following: []
            }
        ];

        // Create the test users
        for (const userData of testUsers) {
            const existingUser = await User.findOne({ firebaseId: userData.firebaseId });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                console.log('Created test user:', userData.email);
            }
        }

        // Get all users to confirm creation
        const allUsers = await User.find({});
        res.json({
            message: 'Test users created successfully',
            users: allUsers
        });
    } catch (error) {
        console.error('Error creating test users:', error);
        res.status(500).json({ error: 'Failed to create test users' });
    }
});

// Add this simple test endpoint
app.get('/api/test/create-users', async (req, res) => {
    try {
        console.log('Creating test users...');
        
        const testUsers = [
            { firebaseId: 'test1', email: 'test1@example.com' },
            { firebaseId: 'test2', email: 'test2@example.com' },
            { firebaseId: 'test3', email: 'test3@example.com' }
        ];

        for (const userData of testUsers) {
            const exists = await User.findOne({ firebaseId: userData.firebaseId });
            if (!exists) {
                const user = new User({
                    ...userData,
                    following: []
                });
                await user.save();
                console.log('Created user:', userData.email);
            }
        }

        const allUsers = await User.find({});
        console.log('All users:', allUsers);
        
        res.json({ message: 'Test users created', users: allUsers });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Failed to create test users' });
    }
});

// Add this debug endpoint to create a test post
app.post('/api/debug/create-test-post', async (req, res) => {
    try {
        const testPost = new Post({
            title: 'Test Plant',
            caption: 'This is a test plant post',
            userId: 'test-user-1',
            likes: 0,
            contentType: 'text/plain'
        });
        await testPost.save();
        res.json({ message: 'Test post created', post: testPost });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create test post' });
    }
});

// Add this debug endpoint to check posts
app.get('/api/debug/check-posts', async (req, res) => {
    try {
        console.log('\n=== CHECKING POSTS ===');
        const posts = await Post.find({});
        console.log('Found posts:', posts.length);
        console.log('Post details:', posts.map(p => ({
            id: p._id,
            title: p.title,
            userId: p.userId,
            hasImage: !!p.image
        })));
        console.log('=== CHECK COMPLETE ===\n');
        
        res.json({
            count: posts.length,
            posts: posts.map(p => ({
                id: p._id,
                title: p.title,
                userId: p.userId,
                hasImage: !!p.image
            }))
        });
    } catch (error) {
        console.error('Error checking posts:', error);
        res.status(500).json({ error: 'Failed to check posts' });
    }
});

// Add this endpoint to update user email
app.post('/api/users/update-email', async (req, res) => {
    try {
        const { firebaseId, email } = req.body;
        const user = await User.findOne({ firebaseId });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.email = email;
        await user.save();
        
        res.json({ message: 'Email updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
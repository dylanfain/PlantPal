const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const Post = require('./models/Post');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//connection to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
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
  console.log("Request body:", req.body);
  console.log("Request file:", req.file); 

  const { title, caption, likes, contentType, userId } = req.body;  // Change 'userID' to 'userId'

  if (!title || !caption || !userId) {
      return res.status(400).json({ error: 'Title, caption, and userId are required' });
  }

  const image = req.file ? req.file.buffer : null;
  try {
      const newPost = new Post({
          title,
          image, // Convert image to Buffer
          caption,
          likes: likes || 0,
          contentType,
          userId  // Use 'userId' here as well
      });

      await newPost.save();
      res.status(201).json(newPost); // Respond with the created post
  } catch (error) {
      console.error('Failed to create post: ', error);
      res.status(400).json({ error: 'Failed to create post' });
  }
});


// retrieves all posts from a specific user - NOT WORKING YET
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
app.post('/api/posts/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create a new comment
    const newComment = new Comment({
      postId: postId,
      text: text,
      userId: req.body.userId, // Pass the userId from request body (or use session/auth)
    });

    await newComment.save();

    res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
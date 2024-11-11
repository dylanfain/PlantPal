const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Post = require('./models/Post');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Sample route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.get('/api/posts/', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts'});
    }
});

app.post('/api/posts', async (req, res) => {
    const { title, content }= req.body;
    try {
        const newPost = new Post({ title, content });
        await newPost.save();
        res.status(201).json(newPost); // Respond with the created post
    } catch (error) {
        res.status(400).json({ error: 'Failed to create post' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
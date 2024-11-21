import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { Button, Navbar, Container, Nav, NavDropdown, Form, FormControl, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Dashboard.css';

const HomeContent = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const userID = currentUser.uid;
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await axios.get(`/api/users/${currentUser.uid}/following`);
        setFollowing(response.data);
      } catch (error) {
        console.error('Error fetching following list:', error);
      }
    };

    fetchFollowing();
  }, [currentUser.uid]);

  // Fetch posts from the server
  useEffect(() => {
  const fetchPosts = async () => {
    if (!userID) {
      console.error('No userID found');
      return;
    }

    console.log(`Fetching posts for userID: ${userID}`);

    try {
      // Update the URL to include userId as a path parameter
      const response = await axios.get(`http://localhost:5000/api/posts/${userID}`);
      const sortedPosts = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

    fetchPosts();
  }, [userID]);

  // Like a post
  const handleLike = async (postId) => {
    try {
      await axios.put(`/api/posts/${postId}/like`);
      setPosts(posts.map((post) =>
        post._id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Start commenting on a post
  const handleComment = (postId) => {
    setCommentingPostId(postId);
  };

  // Handle deletion
  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      setPosts(posts.filter((post) => post._id != postId));
      console.log('Post deleted successfully');
    } catch(error) {
      console.error('Error deleting post:', error.response?.data || error.message);
    }
  };

  // Submit comment
  const submitComment = async (postId, newComment, userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, {
        text: newComment,
        author: userId
      });
  
      console.log(response.data.message); // "Comment added successfully"
      return response.data.post; // The updated post with comments
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home-content">
      <div className="following-section">
        <h3>Following</h3>
        <ul>
          {following.length > 0 ? (
            following.map(userId => (
              <li key={userId}>{userId}</li>
            ))
          ) : (
            <li>No users followed yet</li>
          )}
        </ul>
      </div>
      <div className="plant-feed">
        <h2 className="text-center mb-4">Your Plant Feed</h2>
        <div className="post-container">
          {/* New Post Button Card */}
          <div className="plant-post card mb-3 animate__animated animate__fadeIn navbar-color">
            <Link to="/post" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                  src="/addplant.svg"
                  style={{ width: '50%', cursor: 'pointer' }}
                  className="card-img-top"
                  alt="Add New Plant"
                />
              </div>
              <div className="card-body text-center">
                <h5 className="card-title">Add a New Post</h5>
              </div>
            </Link>
          </div>

          {posts.map((post) => (
            <div key={post._id} className="plant-post card mb-3 animate__animated animate__fadeIn">
              {/* Post Image */}
              <img
                src={`data:${post.contentType};base64,${post.image}`}
                className="card-img-top"
                alt={post.title}
              />

              {/* Post Content */}
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.caption}</p>

                {/* Like Button */}
                <button className="btn btn-success" onClick={() => handleLike(post._id)}>
                  Like ({post.likes})
                </button>

                {/* Comment Button */}
                <button className="btn btn-outline-secondary ml-2" onClick={() => handleComment(post._id)}>
                  Comment ({post.comments?.length || 0})
                </button>
                
                {/* Delete Button */}
                <button className="btn btn-danger" onClick={() => handleDelete(post._id)}>
                  Delete
                </button>

                {/* Comments Section */}
                {post.comments?.length > 0 && (
                  <div className="comments-section mt-3">
                    <h6>Comments:</h6>
                    <ul className="list-unstyled">
                      {post.comments.map((comment) => (
                        <li key={comment._id} className="mb-2">
                          <strong>{comment.author?.username || 'Anonymous'}:</strong> {comment.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Comment Input Box */}
              {commentingPostId === post._id && (
                <div className="comment-box mt-3">
                  <textarea
                    className="form-control"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button
                    className="btn btn-success mt-2"
                    onClick={() => submitComment(post._id)}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
    const [error, setError] = useState("");
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const currentLocation = useLocation();

    async function handleLogout() {
        setError("");

        try {
            await logout();
            navigate("/login");
        } catch {
            setError("Failed to log out");
        }
    }

    const isHome = currentLocation.pathname === "/";

    return (
        <div className="navbar-container">
            <Navbar expand="lg" fixed="top" className="navbar-color">
                <Container>
                    <Navbar.Brand className="me-auto navbar-text">PlantPal</Navbar.Brand>
                    
                    <Form className="d-flex mx-auto" style={{ flexGrow: 1, justifyContent: 'center' }}>
                        <FormControl
                            type="search"
                            placeholder="Search..."
                            className="me-2"
                            aria-label="Search"
                            style={{ width: '300px' }}
                        />
                        <Button variant="outline-success">Search</Button>
                    </Form>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="ms-auto">
                        {/* Post Button */}
                        <Nav.Link 
                          as={Link} 
                          to="/post" 
                          className={`navbar-text ${currentLocation.pathname === "/post" ? "active" : ""}`}
                          style={{ color: currentLocation.pathname === "/post" ? "green" : "inherit" }}
                        >
                          Post
                        </Nav.Link>

                        {/* Home Link */}
                        <Nav.Link 
                          as={Link} 
                          to="/" 
                          className={`navbar-text ${isHome ? "active" : ""}`} 
                          style={{ color: isHome ? "green" : "inherit" }}
                        >
                          Home
                        </Nav.Link>

                        {/* Feed Link */}
                        <Nav.Link 
                          as={Link} 
                          to="/feed" 
                          className={`navbar-text ${currentLocation.pathname === "/feed" ? "active" : ""}`}
                          style={{ color: currentLocation.pathname === "/feed" ? "green" : "inherit" }}
                        >
                          Feed
                        </Nav.Link>

                        {/* Marketplace Link */}
                        <Nav.Link 
                          as={Link} 
                          to="/marketplace" 
                          className={`navbar-text ${currentLocation.pathname === "/marketplace" ? "active" : ""}`}
                          style={{ color: currentLocation.pathname === "/marketplace" ? "green" : "inherit" }}
                        >
                          Marketplace
                        </Nav.Link>
                      </Nav>

                      {/* Profile Dropdown Menu */}
                      <Nav className="dropdown">
                        <NavDropdown title="Profile" id="basic-navbar-nav">
                          <NavDropdown.Item as={Link} to="/settings" className="dropdown-item navbar-color">
                            Settings
                          </NavDropdown.Item>
                          <NavDropdown.Divider />
                          <NavDropdown.Item className="dropdown-item navbar-color">
                            <Button variant="link" onClick={handleLogout}>Log Out</Button>
                          </NavDropdown.Item>
                        </NavDropdown>
                      </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <div className="main-body">
                {isHome && <HomeContent />}
            </div>
            {/* <div className="footer" fixed="bottom">Placeholder</div> */}
        </div>
    );
}
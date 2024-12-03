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
  const [discoverUsers, setDiscoverUsers] = useState([]);

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

  // Add discover users fetch
  useEffect(() => {
    const fetchDiscoverUsers = async () => {
      try {
        const response = await axios.get(`/api/users/discover/${currentUser.uid}`);
        setDiscoverUsers(response.data);
      } catch (error) {
        console.error('Error fetching discover users:', error);
      }
    };

    fetchDiscoverUsers();
  }, [currentUser.uid]);

  // Fetch posts from the server
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Get user's posts
        const userPostsResponse = await axios.get(`/api/posts/${currentUser.uid}`);
        setPosts(userPostsResponse.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser]);

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

  const handleFollow = async (userId) => {
    try {
        await axios.post('/api/users/follow', {
            followerId: currentUser.uid,
            followingId: userId
        });
        
        // Refresh lists
        const [followingResponse, discoverResponse] = await Promise.all([
            axios.get(`/api/users/${currentUser.uid}/following`),
            axios.get(`/api/users/discover/${currentUser.uid}`)
        ]);
        
        setFollowing(followingResponse.data);
        setDiscoverUsers(discoverResponse.data);
    } catch (error) {
        console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
        await axios.post('/api/users/unfollow', {
            followerId: currentUser.uid,
            followingId: userId
        });
        
        // Refresh lists
        const [followingResponse, discoverResponse] = await Promise.all([
            axios.get(`/api/users/${currentUser.uid}/following`),
            axios.get(`/api/users/discover/${currentUser.uid}`)
        ]);
        
        setFollowing(followingResponse.data);
        setDiscoverUsers(discoverResponse.data);
    } catch (error) {
        console.error('Error unfollowing user:', error);
    }
  };

  const getEmailFromUserId = (userId) => {
    const user = discoverUsers.find(u => u.firebaseId === userId);
    return user?.email || 'Unknown User';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home-content">
      <div className="following-section">
        <h3>Following</h3>
        <ul className="list-unstyled">
          {following.length > 0 ? (
            following.map(userId => (
              <li key={userId} className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-truncate me-2">
                    {discoverUsers.find(u => u.firebaseId === userId)?.email || userId}
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleUnfollow(userId)}
                  >
                    Unfollow
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <li>No users followed yet</li>
          )}
        </ul>

        <h3 className="mt-4">Discover Users</h3>
        <ul className="list-unstyled">
          {discoverUsers.map(user => (
            !following.includes(user.firebaseId) && user.email && (
              <li key={user.firebaseId} className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-truncate me-2">{user.email}</div>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => handleFollow(user.firebaseId)}
                  >
                    Follow
                  </Button>
                </div>
              </li>
            )
          ))}
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
              <div className="card-header">
                <span>
                  Posted by: {(() => {
                    const user = discoverUsers.find(u => u.firebaseId === post.userId);
                    return user?.email || post.userId;  // Show email if exists, otherwise show userId
                  })()}
                  {following.includes(post.userId) && ' (Following)'}
                </span>
              </div>
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
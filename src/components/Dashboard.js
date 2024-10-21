import React, { useState } from "react";
import { Button, Navbar, Container, Nav, NavDropdown, Form, FormControl, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Dashboard.css';

const HomeContent = () => {
    const [posts, setPosts] = useState([
      { id: 1, image: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80', title: 'Plant Post 1', description: 'This is a beautiful plant.', likes: 0, comments: [] },
      { id: 2, image: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80', title: 'Plant Post 2', description: 'Check out my new succulent!', likes: 0, comments: [] },
      { id: 3, image: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80', title: 'Plant Post 3', description: 'My garden is blooming!', likes: 0, comments: [] },
    ]);
    const [commentingPostId, setCommentingPostId] = useState(null);
    const [newComment, setNewComment] = useState('');
  
    const handleLike = (postId) => {
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    };
  
    const handleComment = (postId) => {
      setCommentingPostId(postId);
    };
  
    const submitComment = () => {
      if (newComment.trim() !== '') {
        setPosts(posts.map(post => 
          post.id === commentingPostId ? { ...post, comments: [...post.comments, newComment] } : post
        ));
        setNewComment('');
        setCommentingPostId(null);
      }
    };
  
    return (
      <div className="home-content">
        <div className="following-section">
          <h3>Following</h3>
          <ul>
            <li>User 1</li>
            <li>User 2</li>
            <li>User 3</li>
          </ul>
        </div>
        <div className="plant-feed">
          <h2 className="text-center mb-4">Your Plant Feed</h2>
          <div className="post-container">
            {posts.map((post) => (
              <div key={post.id} className="plant-post card mb-3 animate__animated animate__fadeIn">
                <img src={post.image} className="card-img-top" alt={post.title} />
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text">{post.description}</p>
                  <button className="btn btn-success" onClick={() => handleLike(post.id)}>
                    Like ({post.likes})
                  </button>
                  <button className="btn btn-outline-secondary ml-2" onClick={() => handleComment(post.id)}>
                    Comment ({post.comments.length})
                  </button>
                  {post.comments.length > 0 && (
                    <div className="comments-section mt-3">
                      <h6>Comments:</h6>
                      <ul className="list-unstyled">
                        {post.comments.map((comment, index) => (
                          <li key={index} className="mb-2">{comment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {commentingPostId === post.id && (
                  <div className="comment-box">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                    />
                    <button className="btn btn-success" onClick={submitComment}>Submit</button>
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
                    <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="ms-auto">
                        <Nav.Link 
                            as={Link} 
                            to="/" 
                            className={`navbar-text ${isHome ? "active" : ""}`} 
                            style={{ color: isHome ? "green" : "inherit" }} 
                        >
                            Home
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/marketplace" 
                            className={`navbar-text ${currentLocation.pathname === "/marketplace" ? "active" : ""}`} 
                        >
                            Marketplace
                        </Nav.Link>
                      </Nav>
                      <Nav className="dropdown">
                          <NavDropdown title="Profile" id="basic-navbar-nav">
                              <NavDropdown.Item as={Link} to="/settings" className="dropdown-item navbar-color">Settings</NavDropdown.Item>
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
            <div className="footer" fixed="bottom">Placeholder</div>
        </div>
    );
}
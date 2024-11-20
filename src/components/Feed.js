import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { Button, Navbar, Container, Nav, NavDropdown, Form, FormControl, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Dashboard.css';

const ErrorDisplay = ({ error }) => (
  <div className="alert alert-danger m-3">
    <h4>Error Loading Feed</h4>
    <p>{error.message}</p>
    <button 
      className="btn btn-outline-danger"
      onClick={() => window.location.reload()}
    >
      Retry
    </button>
  </div>
);

const FeedContent = () => {
  const { currentUser } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState(new Set());

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await axios.get(`/api/users/${currentUser.uid}/following`);
        setFollowing(response.data);
        setFollowedUsers(new Set(response.data));
      } catch (error) {
        console.error('Error fetching following list:', error);
      }
    };

    fetchFollowing();
  }, [currentUser.uid]);

  const handleFollow = async (userIdToFollow) => {
    try {
      if (followedUsers.has(userIdToFollow)) {
        await axios.post('/api/users/unfollow', {
          followerId: currentUser.uid,
          followingId: userIdToFollow
        });
        setFollowedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userIdToFollow);
          return newSet;
        });
      } else {
        await axios.post('/api/users/follow', {
          followerId: currentUser.uid,
          followingId: userIdToFollow
        });
        setFollowedUsers(prev => new Set([...prev, userIdToFollow]));
      }

      const response = await axios.get(`/api/users/${currentUser.uid}/following`);
      setFollowing(response.data);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

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
        
        <Button 
          variant="outline-success" 
          className="w-100 mb-4"
          onClick={() => window.location.reload()}
        >
          Refresh Feed
        </Button>

        <div className="mt-4">
          <h3>Discover Users</h3>
          <div className="test-users">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span>Test User 1</span>
              <Button 
                variant={followedUsers.has('testUser1') ? "success" : "outline-success"}
                size="sm"
                onClick={() => handleFollow('testUser1')}
              >
                {followedUsers.has('testUser1') ? 'Following' : 'Follow'}
              </Button>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span>Test User 2</span>
              <Button 
                variant={followedUsers.has('testUser2') ? "success" : "outline-success"}
                size="sm"
                onClick={() => handleFollow('testUser2')}
              >
                {followedUsers.has('testUser2') ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="plant-feed">
        <h2 className="text-center mb-4">Your Feed</h2>
        <div className="post-container">
          <Card className="mb-3">
            <Card.Body>
              <h5>Welcome to your feed!</h5>
              <p>Follow users to see their posts here.</p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function Feed() {
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
                to="/post" 
                className="navbar-text"
              >
                Post
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/" 
                className="navbar-text"
              >
                Home
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/feed" 
                className="navbar-text"
                style={{ color: "green" }}
              >
                Feed
              </Nav.Link>
            </Nav>
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
        <FeedContent />
      </div>
    </div>
  );
} 
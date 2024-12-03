import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { Button, Navbar, Container, Nav, NavDropdown, Form, FormControl, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Dashboard.css';

const FeedContent = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState([]);
    const [discoverUsers, setDiscoverUsers] = useState([]);

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const response = await axios.get(`/api/users/${currentUser.uid}/following`);
                setFollowing(response.data);
            } catch (error) {
                console.error('Error fetching following list:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowing();
    }, [currentUser.uid]);

    useEffect(() => {
        const fetchDiscoverUsers = async () => {
            try {
                const response = await axios.get(`/api/users/discover/${currentUser.uid}`);
                setDiscoverUsers(response.data);
            } catch (error) {
                console.error('Error fetching discover users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscoverUsers();
    }, [currentUser.uid]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                console.log('About to fetch posts for user:', currentUser?.uid);
                const response = await axios.get(`/api/feed/${currentUser.uid}`);
                if (response.status === 200) {
                    setPosts(response.data.posts);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        if (currentUser) {
            fetchPosts();
        }
    }, [currentUser]);

    const handleFollow = async (userId) => {
        try {
            const data = {
                followerId: currentUser.uid,
                followingId: userId
            };
            console.log('Following request:', {
                currentUser: currentUser.uid,
                targetUser: userId,
                data
            });
            
            const response = await axios.post('/api/users/follow', data);
            console.log('Follow response:', response.data);
            
            // Refresh lists
            const [followingResponse, discoverResponse] = await Promise.all([
                axios.get(`/api/users/${currentUser.uid}/following`),
                axios.get(`/api/users/discover/${currentUser.uid}`)
            ]);
            
            setFollowing(followingResponse.data);
            setDiscoverUsers(discoverResponse.data);
        } catch (error) {
            console.error('Follow error:', {
                message: error.message,
                response: error.response?.data,
                data: error.response?.data
            });
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await axios.post('/api/users/unfollow', {
                followerId: currentUser.uid,
                followingId: userId
            });
            const followingResponse = await axios.get(`/api/users/${currentUser.uid}/following`);
            setFollowing(followingResponse.data);
            
            const discoverResponse = await axios.get(`/api/users/discover/${currentUser.uid}`);
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
                <h2 className="text-center mb-4">Global Plant Feed</h2>
                <div className="post-container">
                    {posts.map((post) => (
                        <div key={post._id} className="plant-post card mb-3">
                            <div className="card-header">
                                <span>
                                    Posted by: {(() => {
                                        const user = discoverUsers.find(u => u.firebaseId === post.userId);
                                        return user?.email || post.userId;  // Show email if exists, otherwise show userId
                                    })()}
                                    {following.includes(post.userId) && ' (Following)'}
                                </span>
                            </div>
                            <img
                                src={`data:${post.contentType};base64,${post.image}`}
                                className="card-img-top"
                                alt={post.title}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{post.title}</h5>
                                <p className="card-text">{post.caption}</p>
                                <button className="btn btn-success">
                                    Like ({post.likes})
                                </button>
                            </div>
                        </div>
                    ))}
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
                            <Nav.Link 
                                as={Link} 
                                to="/marketplace" 
                                className="navbar-text"
                            >
                                Marketplace
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
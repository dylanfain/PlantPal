import React, { useState } from "react";
import { Button, Navbar, Container, Nav, NavDropdown, Form, FormControl } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Dashboard.css';

export default function Dashboard() {
    const [error, setError] = useState("");
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const currentLocation = useLocation();

    // Handles log out functionality and connects to firebase function.
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
                    
                    {/* Search Bar */}
                    <Form className="d-flex mx-auto" style={{ flexGrow: 1, justifyContent: 'center' }}> {/* Centering the search bar */}
                        <FormControl
                            type="search"
                            placeholder="Search..."
                            className="me-2" // Space between the search input and button
                            aria-label="Search"
                            style={{ width: '300px' }} // Adjust width as needed
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
            <div className="main-body"></div>
            <div className="footer" fixed="bottom">Placeholder</div>
        </div>
    );
}
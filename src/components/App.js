import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container, Card } from "react-bootstrap";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Signup from "./Signup";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import Settings from "./Settings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes in card container */}
          <Route path="/login" element={
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
              <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                  <Card.Body>
                    <Login />
                  </Card.Body>
                </Card>
              </div>
            </Container>
          } />
          <Route path="/signup" element={
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
              <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                  <Card.Body>
                    <Signup />
                  </Card.Body>
                </Card>
              </div>
            </Container>
          } />
          <Route path="/forgot-password" element={
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
              <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                  <Card.Body>
                    <ForgotPassword />
                  </Card.Body>
                </Card>
              </div>
            </Container>
          } />

          {/* Private routes */}
          <Route path="/" element={<PrivateRoute component={Dashboard} />} />
          <Route path="/update-profile" element={<PrivateRoute component={UpdateProfile} />} />
          <Route path="/settings" element={<PrivateRoute component={Settings} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
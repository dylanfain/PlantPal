import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Private routes */}
            <Route path="/" element={<PrivateRoute component={Dashboard} />} />
            <Route path="/update-profile" element={<PrivateRoute component={UpdateProfile} />} />
            <Route path="/settings" element={<PrivateRoute component={Settings} />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
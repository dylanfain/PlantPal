import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

//Special Route for User Specific Pages - Just a wrapper that verifies a user is signed in, else go to login
export default function PrivateRoute({ component: Component, ...rest }) {
  const { currentUser } = useAuth();

  return currentUser ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" />
  );
}

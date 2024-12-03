import React, { useRef, useState } from "react"
import { Form, Button, Alert } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import axios from '../config/axios';

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Starting signup process...");

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      console.log("Password mismatch");
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      console.log("Attempting Firebase signup...");
      console.log("Email:", emailRef.current.value);
      // Don't log actual password in production!
      console.log("Password length:", passwordRef.current.value.length);

      const { user } = await signup(emailRef.current.value, passwordRef.current.value);
      console.log("Firebase signup successful:", user.uid);
      
      console.log("Attempting MongoDB user creation...");
      await axios.post('/api/users', {
        firebaseId: user.uid,
        email: user.email
      });
      console.log("MongoDB user created successfully");

      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        response: error.response?.data
      });
      setError("Failed to create an account: " + (error.message || "Unknown error"));
    }
    setLoading(false);
  }

  return (
    <>
      <h2 className="text-center mb-4">Sign Up</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group id="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" ref={emailRef} required />
        </Form.Group>
        <Form.Group id="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" ref={passwordRef} required />
        </Form.Group>
        <Form.Group id="password-confirm">
          <Form.Label>Password Confirmation</Form.Label>
          <Form.Control type="password" ref={passwordConfirmRef} required />
        </Form.Group>
        <Button disabled={loading} className="w-100" type="submit">
          Sign Up
        </Button>
      </Form>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </>
  );
}
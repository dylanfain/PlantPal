import React, { useRef, useState } from "react"
import { Form, Button, Alert } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError("")
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      navigate("/")
    } catch {
      setError("Failed to log in")
    }

    setLoading(false)
  }

  return (
    <>
      <h2 className="text-center mb-4">Log In</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group id="email">
          <Form.Label className="form-label" htmlFor="emailInput">Email</Form.Label>
          <Form.Control type="email" ref={emailRef} id="emailInput" data-testid="emailInput" required />
        </Form.Group>
        <Form.Group id="password">
          <Form.Label className="form-label" htmlFor="passwordInput">Password</Form.Label>
          <Form.Control type="password" ref={passwordRef} id="passwordInput" data-testid="passwordInput" required />
        </Form.Group>

        <Button disabled={loading} className="w-100" type="submit">
          Log In
        </Button>
      </Form>
      <div className="w-100 text-center mt-3">
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </>
  )
}
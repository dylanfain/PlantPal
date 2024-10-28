import React, { useContext, useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // assuming auth is initialized correctly in your firebase.js file

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // Change from undefined to null
  const [loading, setLoading] = useState(true);
  const authInstance = getAuth(); // Initialize auth instance

  function signup(email, password) {
    return createUserWithEmailAndPassword(authInstance, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(authInstance, email, password);
  }

  function logout() {
    return signOut(authInstance);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(authInstance, email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [authInstance]);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

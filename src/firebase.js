// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtvP3oPDiPHEprKRWm0j3BAXNySK4gvUo",
  authDomain: "plantpal-61a59.firebaseapp.com",
  projectId: "plantpal-61a59",
  storageBucket: "plantpal-61a59.appspot.com",
  messagingSenderId: "113014406362",
  appId: "1:113014406362:web:a6aedccbb8cca0a7e239e3",
  measurementId: "G-GMYVN1VGYL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export const signup = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user in MongoDB
    await axios.post('/api/users', {
        firebaseId: result.user.uid,
        email: result.user.email
    });
    
    return result;
};

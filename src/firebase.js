// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

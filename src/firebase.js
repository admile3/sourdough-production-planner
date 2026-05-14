// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvW_HTVOrRzDCz7GwpgqAh8O2uBxziio8",
  authDomain: "sourdough-production-planner.firebaseapp.com",
  projectId: "sourdough-production-planner",
  storageBucket: "sourdough-production-planner.firebasestorage.app",
  messagingSenderId: "45332994857",
  appId: "1:45332994857:web:7cccb2b85a652899217538",
  measurementId: "G-V20PFG30Q2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

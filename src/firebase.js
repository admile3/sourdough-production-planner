import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvW_HTVOrRzDCz7GwpgqAh8O2uBxziio8",
  authDomain: "sourdough-production-planner.firebaseapp.com",
  projectId: "sourdough-production-planner",
  storageBucket: "sourdough-production-planner.firebasestorage.app",
  messagingSenderId: "45332994857",
  appId: "1:45332994857:web:7cccb2b85a652899217538",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

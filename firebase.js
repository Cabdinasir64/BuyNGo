import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtwinHNzdzegzSObfcjbo85Gz6gyMUDts",
  authDomain: "buyngo-a5545.firebaseapp.com",
  projectId: "buyngo-a5545",
  storageBucket: "buyngo-a5545.firebasestorage.app",
  messagingSenderId: "1040711699061",
  appId: "1:1040711699061:web:9a6c6ca2fdd2420009863c",
  measurementId: "G-5FL0MPKZ7G",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

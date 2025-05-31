import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyAtwinHNzdzegzSObfcjbo85Gz6gyMUDts",
  authDomain: "buyngo-a5545.firebaseapp.com",
  projectId: "buyngo-a5545",
  storageBucket: "buyngo-a5545.appspot.com",
  messagingSenderId: "1040711699061",
  appId: "1:1040711699061:web:9a6c6ca2fdd2420009863c",
  measurementId: "G-5FL0MPKZ7G",
};

// Initialize
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();

export default firebase;

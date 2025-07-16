// Firebase App (the core Firebase SDK) is always required and must be listed first
// Add Firebase products that you want to use
// 1. Add the Firebase CDN scripts in your HTML before this file:
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>

// 2. Your web app's Firebase configuration (replace with your own config)
const firebaseConfig = {
  apiKey: "AIzaSyC7gwhcRE58-LGYy8mM8lz1KcJC_DVdJ2Y",
  authDomain: "wastewise-9984f.firebaseapp.com",
  projectId: "wastewise-9984f",
  storageBucket: "wastewise-9984f.appspot.com", // fixed bucket
  messagingSenderId: "284976880819",
  appId: "1:284976880819:web:6c1a8a3ca6538c80b924c6",
  measurementId: "G-VTG9TJRV1P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Email/Password Sign Up
function signUpWithEmail(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

// Email/Password Login
function loginWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// Google Sign-In
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
}

// Sign Out
function signOut() {
  return auth.signOut();
}

// Export functions for use in other scripts
window.firebaseAuth = {
  signUpWithEmail,
  loginWithEmail,
  signInWithGoogle,
  signOut
};

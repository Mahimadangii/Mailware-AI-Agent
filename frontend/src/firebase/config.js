// src/firebase/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration & Setup
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGJGdW4S_gpZfj9FNEUyva7X4tD6q0nl8",
  authDomain: "mailware-31211.firebaseapp.com",
  projectId: "mailware-31211",
  storageBucket: "mailware-31211.firebasestorage.app",
  messagingSenderId: "150151767541",
  appId: "1:150151767541:web:bd857fb490fb2133002cbc",
  measurementId: "G-EPWRR52GEB"
};  

// Initialize Firebase (safe to call multiple times — Firebase deduplicates)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google provider — always show account picker
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// 🔥 Ye Firebase ko bolegi ki Gmail read karne ki permission maango
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Sign in with Google popup. Returns the Firebase User on success. */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Google se Access Token nikalna
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    
    console.log("Mil gaya Gmail Access Token! 🚀");
    result.user.gmailAccessToken = accessToken;

    // 🔥 NAYA CODE: Token ko save karna taaki Sync Button use kar sake
    if (accessToken) {
        localStorage.setItem("gmailToken", accessToken);
        
        try {
            console.log("Backend ko token bhej rahe hain...");
            const response = await fetch('http://localhost:5000/api/auth/save-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: accessToken, userEmail: result.user.email })
            });

            const data = await response.json();
            console.log("Backend se Jawab Aaya:", data.message);

            if (data.tasks && data.tasks.length > 0) {
                console.log("✅ Initial Tasks mil gaye! LocalStorage mein save kar rahe hain...");
                localStorage.setItem("aiTasks", JSON.stringify(data.tasks));
                window.dispatchEvent(new Event("tasksUpdated")); 
            } else {
                console.log("ℹ️ Koi naye tasks nahi mile.");
            }
        } catch (backendError) {
            console.error("Backend server error:", backendError);
        }
    }

    return result.user;
  } catch (error) {
    console.error("Login me error aa gaya:", error);
    throw error;
  }
}

// 🔥 NAYA FUNCTION: Sync Button ke liye Manual Fetch
export async function syncEmails(userEmail) {
  const token = localStorage.getItem("gmailToken");
  
  if (!token) {
    throw new Error("Session expired. Please sign out and sign in again.");
  }

  const response = await fetch('http://localhost:5000/api/auth/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, userEmail: userEmail })
  });

  if (!response.ok) {
    throw new Error("Backend se connect karne mein issue aaya.");
  }

  const data = await response.json();
  return data.tasks || []; // Array of raw tasks return karega
}

/** Sign out the current user and clear data. */
export async function signOutUser() {
  // Logout karte waqt saari purani memory clear kar do
  localStorage.removeItem("aiTasks");
  localStorage.removeItem("mailwareBoardData");
  localStorage.removeItem("gmailToken");
  await signOut(auth);
}

/** Subscribe to auth state changes. */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
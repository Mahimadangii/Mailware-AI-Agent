// src/firebase/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Replace the values below with your own Firebase project credentials.
// Get them from: https://console.firebase.google.com
//   → Your project → Project Settings → Your apps → Web app → SDK setup
//
// Also enable Google Sign-In:
//   Firebase Console → Authentication → Sign-in method → Google → Enable
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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase (safe to call multiple times — Firebase deduplicates)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google provider — always show account picker
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Sign in with Google popup. Returns the Firebase User on success. */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/** Sign out the current user. */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function — call it in a useEffect cleanup.
 * @param {(user: import("firebase/auth").User | null) => void} callback
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

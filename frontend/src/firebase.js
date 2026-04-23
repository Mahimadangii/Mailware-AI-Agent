// src/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBGJGdW4S_gpZfj9FNEUyva7X4tD6q0nl8",
  authDomain: "mailware-31211.firebaseapp.com",
  projectId: "mailware-31211",
  storageBucket: "mailware-31211.firebasestorage.app",
  messagingSenderId: "150151767541",
  appId: "1:150151767541:web:bd857fb490fb2133002cbc",
  measurementId: "G-EPWRR52GEB"
};

// ✅ Prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics (optional)
let analytics;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.log("Analytics not supported");
  }
}

export { app, analytics };
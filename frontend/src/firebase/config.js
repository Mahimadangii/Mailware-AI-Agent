// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGJGdW4S_gpZfj9FNEUyva7X4tD6q0nl8",
  authDomain: "mailware-31211.firebaseapp.com",
  projectId: "mailware-31211",
  storageBucket: "mailware-31211.firebasestorage.app",
  messagingSenderId: "150151767541",
  appId: "1:150151767541:web:bd857fb490fb2133002cbc",
  measurementId: "G-EPWRR52GEB"
};  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify'); 
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    result.user.gmailAccessToken = accessToken;
    if (accessToken) {
        localStorage.setItem("gmailToken", accessToken);
        try {
            const response = await fetch('http://localhost:5000/api/auth/save-token', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: accessToken, userEmail: result.user.email })
            });
            const data = await response.json();
            if (data.tasks && data.tasks.length > 0) {
                localStorage.setItem("aiTasks", JSON.stringify(data.tasks));
                window.dispatchEvent(new Event("tasksUpdated")); 
            }
        } catch (error) { console.error("Backend error:", error); }
    }
    return result.user;
  } catch (error) { throw error; }
}

export async function syncEmails(userEmail) {
  const token = localStorage.getItem("gmailToken");
  const response = await fetch('http://localhost:5000/api/auth/save-token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token, userEmail: userEmail })
  });
  const data = await response.json();
  return data.tasks || []; 
}

export async function fetchInboxData() {
    const token = localStorage.getItem("gmailToken");
    const response = await fetch('http://localhost:5000/api/auth/inbox', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token })
    });
    const data = await response.json();
    return data.emails || []; 
}

// 🔥 NAYA: Sent Data fetch
export async function fetchSentData() {
    const token = localStorage.getItem("gmailToken");
    const response = await fetch('http://localhost:5000/api/auth/sent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token })
    });
    const data = await response.json();
    return data.emails || []; 
}

export async function fetchFullEmail(messageId) {
    const token = localStorage.getItem("gmailToken");
    const response = await fetch('http://localhost:5000/api/auth/email-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, messageId })
    });
    const data = await response.json();
    return data.body; 
}

export async function trashEmailAPI(messageId) {
    const token = localStorage.getItem("gmailToken");
    const response = await fetch('http://localhost:5000/api/auth/action/trash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, messageId }) });
    return response.json();
}

export async function archiveEmailAPI(messageId) {
    const token = localStorage.getItem("gmailToken");
    const response = await fetch('http://localhost:5000/api/auth/action/archive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, messageId }) });
    return response.json();
}

export async function replyToEmailAPI(messageId, replyText) {
    const token = localStorage.getItem("gmailToken");
    const response = await fetch('http://localhost:5000/api/auth/action/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, messageId, replyText }) });
    return response.json();
}

export async function sendNewEmailAPI(to, subject, bodyText) {
    const token = localStorage.getItem("gmailToken");
    const response = await fetch('http://localhost:5000/api/auth/action/send', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, to, subject, bodyText }) 
    });
    return response.json();
}

export async function signOutUser() {
  localStorage.removeItem("aiTasks");
  localStorage.removeItem("mailwareBoardData");
  localStorage.removeItem("gmailToken");
  await signOut(auth);
}

export function subscribeToAuthChanges(callback) { return onAuthStateChanged(auth, callback); }
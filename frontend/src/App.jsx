// src/App.jsx
import { useAuth } from "./hooks/useAuth";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { app } from "./firebase";
import "./styles/global.css";

/**
 * App — root component.
 *
 * Auth flow:
 *   loading  → full-screen spinner (Firebase checking session)
 *   !user    → LandingPage (with sign-in CTAs)
 *   user     → Dashboard
 *
 * The `user` state is driven entirely by Firebase's onAuthStateChanged,
 * which persists sessions across page refreshes automatically.
 */
export default function App() {
  const { user, loading } = useAuth();

  // ── Initial auth check ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          gap: 16,
          fontFamily: "'Google Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: 32, height: 32,
            border: "3px solid #e8eaed",
            borderTopColor: "#1a73e8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: 14, color: "#9aa0a6" }}>Loading Mailware…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Authenticated → Dashboard ───────────────────────────────────────────────
  if (user) {
    return <Dashboard user={user} />;
  }

  // ── Not authenticated → Landing Page ────────────────────────────────────────
  // onSignIn is called by GoogleSignInButton on success.
  // useAuth's onAuthStateChanged picks up the new session automatically
  // and re-renders this component with `user` set — no manual state needed.
  return <LandingPage onSignIn={() => {}} />;
}

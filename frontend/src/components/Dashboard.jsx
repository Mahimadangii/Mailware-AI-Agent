// src/components/Dashboard.jsx
import { useState } from "react";
import { BrandMark } from "./BrandMark";
import { signOutUser } from "../firebase/config";

/**
 * Dashboard — shown after successful Google sign-in.
 * Replace this with your full dashboard implementation.
 */
export function Dashboard({ user }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOutUser();
    // Auth state change handled by useAuth → LandingPage re-renders
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Google Sans', sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #e8eaed",
          padding: "48px 56px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <BrandMark size={48} color="#1a73e8" radius={12} />
        </div>

        <h1
          style={{
            fontFamily: "'Google Sans Display', sans-serif",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#202124",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          Welcome to Mailware!
        </h1>

        <p style={{ fontSize: 15, color: "#5f6368", lineHeight: 1.6, marginBottom: 32 }}>
          You're signed in as{" "}
          <strong style={{ color: "#202124" }}>{user?.email}</strong>.
          <br />
          Your inbox is now connected — Mailware is processing your emails.
        </p>

        {/* User avatar */}
        {user?.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName}
            style={{
              width: 64, height: 64,
              borderRadius: "50%",
              border: "3px solid #e8eaed",
              marginBottom: 20,
            }}
          />
        )}

        <div
          style={{
            background: "#e8f0fe",
            borderRadius: 12,
            padding: "14px 20px",
            marginBottom: 28,
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 12, color: "#1a73e8", fontWeight: 500, marginBottom: 4 }}>
            ✦ AI is working
          </div>
          <div style={{ fontSize: 13, color: "#1557b0" }}>
            Scanning your inbox and extracting tasks. Your first digest will be ready shortly.
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            padding: "10px 28px",
            fontSize: 14, fontWeight: 500,
            color: "#5f6368",
            background: "transparent",
            border: "1px solid #dadce0",
            borderRadius: 24,
            cursor: signingOut ? "not-allowed" : "pointer",
            fontFamily: "'Google Sans', sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f3f4"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>

        <p style={{ marginTop: 20, fontSize: 12, color: "#bdc1c6" }}>
          Replace this placeholder with your full dashboard.
          <br />
          See <code style={{ fontSize: 11 }}>src/components/Dashboard.jsx</code>
        </p>
      </div>
    </div>
  );
}

// src/components/GoogleSignInButton.jsx
import { useState } from "react";
import { signInWithGoogle } from "../firebase/config";

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Spinner = () => (
  <div
    style={{
      width: 20, height: 20,
      border: "2px solid #d2e3fc",
      borderTopColor: "#1a73e8",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }}
  />
);

/**
 * GoogleSignInButton
 * @param {function} onSuccess - called with Firebase user on success
 * @param {function} onError   - called with error on failure
 * @param {string}   label     - button text
 * @param {string}   variant   - "primary" | "outline"
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  label = "Continue with Google — it's free",
  variant = "outline",
}) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleClick = async () => {
    if (status !== "idle") return;
    setStatus("loading");
    try {
      const user = await signInWithGoogle();
      setStatus("success");
      onSuccess?.(user);
    } catch (err) {
      console.error("Google sign-in error:", err);
      setStatus("error");
      onError?.(err);
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError   = status === "error";

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 28px",
    borderRadius: 28,
    fontSize: 15,
    fontWeight: 500,
    fontFamily: "'Google Sans', sans-serif",
    cursor: isLoading || isSuccess ? "not-allowed" : "pointer",
    border: "1.5px solid",
    transition: "box-shadow 0.2s, transform 0.15s, border-color 0.2s, background 0.2s",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    justifyContent: "center",
  };

  const stateStyle = isError
    ? { background: "#fce8e6", borderColor: "#f28b82", color: "#c5221f" }
    : isSuccess
    ? { background: "#e6f4ea", borderColor: "#81c995", color: "#188038" }
    : isLoading
    ? { background: "#e8f0fe", borderColor: "#93c5fd", color: "#1a73e8" }
    : { background: "#fff", borderColor: "#dadce0", color: "#202124" };

  const labelText = isLoading
    ? "Connecting to Google…"
    : isSuccess
    ? "Signed in — redirecting"
    : isError
    ? "Sign-in failed — try again"
    : label;

  return (
    <button
      style={{ ...baseStyle, ...stateStyle }}
      onClick={handleClick}
      disabled={isLoading || isSuccess}
      onMouseEnter={(e) => {
        if (status === "idle") {
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.borderColor = "#bdc1c6";
        }
      }}
      onMouseLeave={(e) => {
        if (status === "idle") {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "#dadce0";
        }
      }}
    >
      {/* Loading progress bar */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0,
            height: 3,
            background: "#1a73e8",
            animation: "loadBar 1.8s ease-in-out infinite",
            borderRadius: "0 0 28px 28px",
          }}
        />
      )}

      {/* Icon */}
      {isLoading ? <Spinner /> : <GoogleLogo />}

      {/* Label */}
      <span>{labelText}</span>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loadBar {
          0%   { width: 0; opacity: 1; }
          70%  { width: 80%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </button>
  );
}

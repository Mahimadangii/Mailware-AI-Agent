// src/components/CtaAndFooter.jsx
import { useScrollReveal } from "../hooks/useScrollReveal";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { BrandMark } from "./BrandMark";

const FOOTER_LINKS = ["Product", "Pricing", "Blog", "Docs", "Privacy", "Terms"];

// ─── CTA Section ──────────────────────────────────────────────────────────────
export function CtaSection({ onSignIn }) {
  const ref = useScrollReveal();

  return (
    <section
      id="pricing"
      style={{
        padding: "96px 24px",
        textAlign: "center",
        background: "#f8f9fa",
        borderTop: "1px solid #e8eaed",
      }}
    >
      <div
        ref={ref}
        className="reveal"
        style={{ maxWidth: 560, margin: "0 auto" }}
      >
        <h2
          style={{
            fontFamily: "'Google Sans Display', sans-serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 700,
            color: "#202124",
            letterSpacing: "-0.025em",
            marginBottom: 16,
          }}
        >
          Ready to reclaim your inbox?
        </h2>

        <p
          style={{
            fontSize: "1.05rem",
            color: "#5f6368",
            maxWidth: 420,
            margin: "0 auto 40px",
            lineHeight: 1.65,
          }}
        >
          Free for individuals. No credit card required. Setup takes under 60 seconds.
        </p>

        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          <GoogleSignInButton
            onSuccess={onSignIn}
            label="Continue with Google — it's free"
          />
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: "#bdc1c6" }}>
          By signing up you agree to our{" "}
          <a href="#" style={{ color: "#9aa0a6", textDecoration: "underline" }}>Terms</a>
          {" "}&amp;{" "}
          <a href="#" style={{ color: "#9aa0a6", textDecoration: "underline" }}>Privacy Policy</a>
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer
      style={{
        padding: "40px 48px",
        borderTop: "1px solid #e8eaed",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BrandMark size={26} radius={6} color="#1a73e8" />
        <span style={{ fontSize: 15, fontWeight: 500, color: "#202124", letterSpacing: "-0.01em" }}>
          Mailware
        </span>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {FOOTER_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            style={{
              fontSize: 13, color: "#9aa0a6",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#202124"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9aa0a6"; }}
          >
            {link}
          </a>
        ))}
      </div>

      <div style={{ fontSize: 13, color: "#9aa0a6" }}>
        © {new Date().getFullYear()} Mailware Inc.
      </div>
    </footer>
  );
}

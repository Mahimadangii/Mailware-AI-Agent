// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { BrandMark } from "./BrandMark";
import { GoogleSignInButton } from "./GoogleSignInButton";

const styles = {
  nav: (scrolled) => ({
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    padding: "0 32px",
    height: 64,
    background: scrolled ? "#fff" : "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: scrolled ? "1px solid #e8eaed" : "1px solid transparent",
    transition: "border-color 0.3s, background 0.3s",
  }),
  brand: {
    display: "flex", alignItems: "center", gap: 8,
    textDecoration: "none", cursor: "pointer",
  },
  brandName: {
    fontSize: 20, fontWeight: 500,
    color: "#202124", letterSpacing: "-0.01em",
  },
  navLinks: {
    display: "flex", alignItems: "center",
    gap: 4, marginLeft: 40,
  },
  navLink: {
    padding: "8px 14px",
    fontSize: 14, color: "#5f6368",
    borderRadius: 24, cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    textDecoration: "none",
  },
  navRight: {
    marginLeft: "auto",
    display: "flex", alignItems: "center", gap: 10,
  },
  btnSignIn: {
    padding: "9px 24px",
    fontSize: 14, fontWeight: 500,
    color: "#1a73e8", borderRadius: 24,
    background: "transparent", border: "none",
    transition: "background 0.15s",
  },
  btnTry: {
    padding: "9px 24px",
    fontSize: 14, fontWeight: 500,
    color: "#fff", background: "#1a73e8",
    borderRadius: 24, border: "none",
    transition: "background 0.15s, box-shadow 0.15s",
  },
};

const NAV_LINKS = ["Features", "How it works", "Pricing", "Enterprise"];

export function Navbar({ onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id) => {
    const map = {
      "Features": "features",
      "How it works": "how",
      "Pricing": "pricing",
    };
    const el = document.getElementById(map[id]);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav style={styles.nav(scrolled)}>
      <a style={styles.brand} href="#top">
        <BrandMark size={32} color="#1a73e8" />
        <span style={styles.brandName}>Mailware</span>
      </a>

      <div style={styles.navLinks}>
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            style={{
              ...styles.navLink,
              background: hoveredLink === link ? "#f1f3f4" : "transparent",
              color: hoveredLink === link ? "#202124" : "#5f6368",
            }}
            onMouseEnter={() => setHoveredLink(link)}
            onMouseLeave={() => setHoveredLink(null)}
            onClick={() => scrollTo(link)}
            href="#"
          >
            {link}
          </a>
        ))}
      </div>

      <div style={styles.navRight}>
        <button
          style={styles.btnSignIn}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#e8f0fe"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          onClick={onSignIn}
        >
          Sign in
        </button>
        <button
          style={styles.btnTry}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1557b0";
            e.currentTarget.style.boxShadow = "0 1px 6px rgba(26,115,232,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1a73e8";
            e.currentTarget.style.boxShadow = "none";
          }}
          onClick={onSignIn}
        >
          Try Mailware free
        </button>
      </div>
    </nav>
  );
}

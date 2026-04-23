// src/components/Sections.jsx
import { useState, useEffect, useRef } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

// ─── Section Tag ──────────────────────────────────────────────────────────────
function SectionTag({ label, color = "blue" }) {
  const colors = {
    blue:   { background: "#e8f0fe", color: "#1a73e8" },
    green:  { background: "#e6f4ea", color: "#188038" },
    orange: { background: "#fce8e6", color: "#c5221f" },
  };
  return (
    <div
      style={{
        display: "inline-block",
        padding: "4px 14px",
        borderRadius: 12,
        fontSize: 12, fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: 16,
        ...colors[color],
      }}
    >
      {label}
    </div>
  );
}

// ─── Logos Strip ──────────────────────────────────────────────────────────────
const COMPANIES = ["Stripe", "Notion", "Linear", "Vercel", "Loom", "Figma"];

export function LogosStrip() {
  const ref = useScrollReveal();
  const [hovered, setHovered] = useState(null);

  return (
    <div
      ref={ref}
      className="reveal"
      style={{
        padding: "48px 24px",
        textAlign: "center",
        background: "#f8f9fa",
        borderTop: "1px solid #e8eaed",
        borderBottom: "1px solid #e8eaed",
      }}
    >
      <div style={{ fontSize: 13, color: "#9aa0a6", marginBottom: 28, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Trusted by teams at
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
        {COMPANIES.map((name) => (
          <span
            key={name}
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              fontSize: 18, fontWeight: 700,
              color: hovered === name ? "#bdc1c6" : "#dadce0",
              letterSpacing: "-0.02em",
              transition: "color 0.2s",
              cursor: "default",
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "AI task extraction",
    desc: "Mailware reads every email the moment it arrives and extracts action items, deadlines, and requests — automatically.",
    iconBg: "#e8f0fe",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="3" width="18" height="14" rx="3" stroke="#1a73e8" strokeWidth="1.6"/>
        <path d="M2 7l9 6 9-6" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Smart prioritization",
    desc: "Not all emails are equal. Mailware scores urgency based on sender, deadlines, and context so your most critical tasks surface first.",
    iconBg: "#e6f4ea",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="3" stroke="#34a853" strokeWidth="1.6"/>
        <path d="M7 11l3 3 5-5" stroke="#34a853" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Deadline tracking",
    desc: 'Every extracted task is enriched with deadline context parsed from email content. Never miss a "by EOD Friday" again.',
    iconBg: "#fce8e6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#ea4335" strokeWidth="1.6"/>
        <path d="M11 7v4.5l3 2" stroke="#ea4335" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Daily digest",
    desc: "Every morning, Mailware sends a clean digest of your open tasks, grouped by project and priority — your day, pre-planned.",
    iconBg: "#fff3e0",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L3 8v6l8 5 8-5V8L11 3z" stroke="#f09300" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M11 3v16M3 8l8 5 8-5" stroke="#f09300" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Team sync",
    desc: "Tasks assigned to teammates are auto-routed to shared boards. One thread, zero duplication, full accountability.",
    iconBg: "#f3e8fd",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="12" rx="2.5" stroke="#9334e9" strokeWidth="1.6"/>
        <path d="M7 9h8M7 13h5" stroke="#9334e9" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Integrations",
    desc: "Push tasks directly to Notion, Linear, Asana, or Jira. Mailware bridges your inbox and your tools seamlessly.",
    iconBg: "#e8f5e9",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11h14M11 4l7 7-7 7" stroke="#00897b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function FeaturesSection() {
  const headerRef = useScrollReveal();
  const gridRef = useScrollReveal(0.08);
  const [hovered, setHovered] = useState(null);

  return (
    <section id="features" style={{ padding: "96px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <div ref={headerRef} className="reveal">
        <SectionTag label="Features" color="blue" />
        <h2
          style={{
            fontFamily: "'Google Sans Display', sans-serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "#202124",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Everything your inbox<br />wishes it could do
        </h2>
        <p style={{ fontSize: "1.05rem", color: "#5f6368", lineHeight: 1.7, maxWidth: 520 }}>
          Mailware sits invisibly between your inbox and your day, pulling out exactly what needs your attention.
        </p>
      </div>

      <div
        ref={gridRef}
        className="reveal"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 56,
        }}
      >
        {FEATURES.map((feat, i) => (
          <div
            key={feat.title}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: 28,
              borderRadius: 16,
              border: "1px solid #e8eaed",
              background: "#fff",
              transition: "box-shadow 0.2s, transform 0.2s",
              boxShadow: hovered === i ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
              transform: hovered === i ? "translateY(-3px)" : "translateY(0)",
              cursor: "default",
            }}
          >
            <div
              style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: feat.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              {feat.icon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#202124", marginBottom: 8 }}>
              {feat.title}
            </div>
            <div style={{ fontSize: 14, color: "#5f6368", lineHeight: 1.6 }}>
              {feat.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: 1,
    title: "Connect your Gmail",
    desc: "Sign in with your Google Workspace account. Mailware requests read-only access — we can never send, delete, or modify emails on your behalf.",
  },
  {
    num: 2,
    title: "AI reads and extracts",
    desc: "Every incoming email is processed by our task-extraction model. Sender intent, deadlines, and action items are parsed in under 2 seconds.",
  },
  {
    num: 3,
    title: "Your day, pre-planned",
    desc: "Tasks appear in your Mailware board, sorted by priority and due date. Check them off, assign them, or push them to your favourite project tool.",
  },
];

export function HowItWorks() {
  const headerRef = useScrollReveal();
  const stepsRef = useScrollReveal(0.1);

  return (
    <div id="how" style={{ padding: "96px 24px", background: "#f8f9fa" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div ref={headerRef} className="reveal" style={{ textAlign: "center" }}>
          <SectionTag label="How it works" color="green" />
          <h2
            style={{
              fontFamily: "'Google Sans Display', sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              color: "#202124",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            From chaos to clarity<br />in three steps
          </h2>
        </div>

        <div
          ref={stepsRef}
          className="reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 40,
            marginTop: 56,
          }}
        >
          {STEPS.map((step) => (
            <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36, height: 36,
                  borderRadius: "50%",
                  background: "#1a73e8",
                  color: "#fff",
                  fontSize: 15, fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, color: "#202124", marginBottom: 8 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 14, color: "#5f6368", lineHeight: 1.65 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
const STATS = [
  { val: 4.2, suffix: "h", label: "Saved per week per user", isFloat: true },
  { val: 98,  suffix: "%", label: "Task extraction accuracy" },
  { val: 2,   suffix: "s", label: "Average processing time" },
  { val: 0,   suffix: "",  label: "Minutes of setup required" },
];

function AnimatedStat({ val, suffix, label, isFloat, triggered }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    let start = null;
    const duration = 1200;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = val * eased;
      setDisplay(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [triggered, val, isFloat]);

  return (
    <div
      style={{
        padding: 24,
        background: "rgba(255,255,255,0.15)",
        borderRadius: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "2.4rem",
          fontWeight: 500,
          color: "#fff",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {display}{suffix}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{label}</div>
    </div>
  );
}

export function StatsSection() {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef(null);
  const revealRef = useScrollReveal();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ padding: "80px 24px", background: "#1a73e8" }}>
      <div
        ref={revealRef}
        className="reveal"
        style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}
      >
        <h2
          style={{
            fontFamily: "'Google Sans Display', sans-serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 56,
          }}
        >
          The numbers speak for themselves
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
          }}
        >
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} triggered={triggered} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I used to spend 45 minutes every morning triaging email. With Mailware, I open my task list and my day is already structured. Game-changer.",
    name: "Arjun Kapoor",
    role: "Head of Product, Razorpay",
    initials: "AK",
    avatarBg: "#e8f0fe", avatarColor: "#1a73e8",
  },
  {
    quote: "The accuracy is honestly scary good. It picked up a soft deadline buried in paragraph three of a vendor email I almost missed entirely.",
    name: "Shreya Rao",
    role: "Engineering Manager, Cred",
    initials: "SR",
    avatarBg: "#e6f4ea", avatarColor: "#188038",
  },
  {
    quote: "We rolled this out to the entire ops team. Inbox zero isn't a myth anymore — it's just Tuesday morning. Mailware is how email should have always worked.",
    name: "Priya Tiwari",
    role: "COO, Groww",
    initials: "PT",
    avatarBg: "#fce8e6", avatarColor: "#c5221f",
  },
];

export function TestimonialsSection() {
  const headerRef = useScrollReveal();
  const gridRef = useScrollReveal(0.08);

  return (
    <section style={{ padding: "96px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <div ref={headerRef} className="reveal" style={{ textAlign: "center" }}>
        <SectionTag label="Testimonials" color="orange" />
        <h2
          style={{
            fontFamily: "'Google Sans Display', sans-serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "#202124",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}
        >
          Loved by people<br />who hate email
        </h2>
      </div>

      <div
        ref={gridRef}
        className="reveal"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 56,
        }}
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            style={{
              padding: 28, borderRadius: 16,
              border: "1px solid #e8eaed", background: "#fff",
            }}
          >
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: "#fbbc04", fontSize: 16 }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: 15, color: "#202124", lineHeight: 1.65, marginBottom: 20, fontStyle: "italic" }}>
              "{t.quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36, height: 36,
                  borderRadius: "50%",
                  background: t.avatarBg,
                  color: t.avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, flexShrink: 0,
                }}
              >
                {t.initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#202124" }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#9aa0a6" }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

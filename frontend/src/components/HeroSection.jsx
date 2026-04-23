// src/components/HeroSection.jsx
import { GoogleSignInButton } from "./GoogleSignInButton";
import { BrandMark } from "./BrandMark";

// ─── Sub-components ───────────────────────────────────────────────────────────

function BackgroundRings() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {[400, 600, 820, 1060].map((size, i) => (
        <div
          key={size}
          style={{
            position: "absolute",
            width: size, height: size,
            borderRadius: "50%",
            border: `1px solid ${i < 2 ? "#e8eaed" : "#f1f3f4"}`,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            animation: `ringPulse 4s ${i * 0.5}s ease-in-out infinite`,
            opacity: 1 - i * 0.1,
          }}
        />
      ))}
      <style>{`
        @keyframes ringPulse {
          0%,100% { opacity:0.6; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity:1;   transform: translate(-50%,-50%) scale(1.015); }
        }
      `}</style>
    </div>
  );
}

function EyebrowBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        borderRadius: 20,
        background: "#e8f0fe",
        color: "#1a73e8",
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 28,
        position: "relative",
        zIndex: 1,
        animation: "fadeUp 0.6s ease both",
      }}
    >
      <div
        style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: "#1a73e8",
          animation: "blink 2s ease-in-out infinite",
        }}
      />
      AI-powered inbox management · Now in beta
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

const TRUST_ITEMS = [
  {
    label: "SOC 2 Type II",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1l1.5 4.5H14l-3.75 2.75 1.5 4.5L8 10 4.25 12.75l1.5-4.5L2 5.5h4.5L8 1z" fill="#34a853"/>
      </svg>
    ),
  },
  {
    label: "Read-only access",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="7" width="12" height="8" rx="1.5" stroke="#9aa0a6" strokeWidth="1.3"/>
        <path d="M5 7V5a3 3 0 016 0v2" stroke="#9aa0a6" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "GDPR compliant",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="#9aa0a6" strokeWidth="1.3"/>
        <path d="M5 8l2 2 4-4" stroke="#9aa0a6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "No data sold, ever",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M8 3v10" stroke="#9aa0a6" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="6.5" stroke="#9aa0a6" strokeWidth="1.3"/>
      </svg>
    ),
  },
];

// ─── Inbox Mockup ─────────────────────────────────────────────────────────────

const MOCK_EMAILS = [
  {
    sender: "Jensen Koch",
    subject: "Q3 budget approval — needs your sign-off by EOD",
    ai: "AI: 1 task extracted — approve budget document",
    tag: "urgent",
    tagStyle: { background: "#fce8e6", color: "#c5221f" },
    time: "9:14 AM",
    unread: true,
    delay: "0s",
  },
  {
    sender: "Sneha Rao",
    subject: "Design review invite — Mailware 2.0 dashboard",
    ai: "AI: 2 tasks — accept invite, prep review notes",
    tag: "meeting",
    tagStyle: { background: "#e6f4ea", color: "#188038" },
    time: "8:52 AM",
    unread: true,
    delay: "1.1s",
  },
  {
    sender: "Meera Tiwari",
    subject: "Invoice #1047 from vendor — payment due 30 Apr",
    ai: "AI: 1 task — schedule payment before deadline",
    tag: "invoice",
    tagStyle: { background: "#e8f0fe", color: "#1a73e8" },
    time: "8:11 AM",
    unread: false,
    delay: "2.2s",
  },
  {
    sender: "Priya Gupta",
    subject: "Onboarding checklist — Ravi starts Monday",
    ai: "AI: 3 tasks extracted · all completed ✓",
    aiColor: "#34a853",
    tag: "done",
    tagStyle: { background: "#e6f4ea", color: "#188038" },
    time: "Yesterday",
    unread: false,
    delay: "3.3s",
  },
];

function InboxMockup() {
  return (
    <div
      style={{
        width: "min(860px, 90vw)",
        marginTop: 60,
        position: "relative",
        zIndex: 1,
        animation: "fadeUp 0.7s 0.5s ease both, floatMockup 6s 1.2s ease-in-out infinite",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #dadce0",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            height: 40,
            background: "#f8f9fa",
            borderBottom: "1px solid #e8eaed",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
          }}
        >
          {[["#ff5f57","#E0E0E0"], ["#ffbd2e","#E0E0E0"], ["#28c840","#E0E0E0"]].map(([bg], i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: bg }} />
          ))}
          <div
            style={{
              flex: 1, maxWidth: 300, margin: "0 auto",
              height: 24, background: "#fff",
              borderRadius: 12, border: "1px solid #dadce0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "#9aa0a6",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            app.mailware.io/inbox
          </div>
        </div>

        {/* App body */}
        <div style={{ display: "flex", height: 380 }}>
          {/* Sidebar */}
          <div
            style={{
              width: 220, borderRight: "1px solid #e8eaed",
              padding: "16px 0", background: "#f6f8fc", flexShrink: 0,
            }}
          >
            {[
              { label: "Inbox", badge: "12", badgeColor: "#1a73e8", active: true },
              { label: "Tasks", badge: "5",  badgeColor: "#34a853" },
              { label: "Snoozed" },
            ].map(({ label, badge, badgeColor, active }) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 20px",
                  margin: "1px 16px 1px 0",
                  borderRadius: "0 100px 100px 0",
                  fontSize: 13,
                  color: active ? "#001d35" : "#444746",
                  fontWeight: active ? 500 : 400,
                  background: active ? "#d3e3fd" : "transparent",
                }}
              >
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                  <span style={{ fontSize: 12, fontWeight: 500, color: badgeColor }}>
                    {badge}
                  </span>
                )}
              </div>
            ))}

            <div style={{
              margin: "12px 20px 8px",
              fontSize: 11, color: "#9aa0a6",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              Labels
            </div>
            {[
              { label: "Urgent", dot: "#ea4335" },
              { label: "Review", dot: "#1a73e8" },
              { label: "Meetings", dot: "#34a853" },
            ].map(({ label, dot }) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "7px 20px",
                  fontSize: 13, color: "#444746",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>

          {/* Main email list */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {/* Tabs */}
            <div
              style={{
                height: 48, borderBottom: "1px solid #e8eaed",
                display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
              }}
            >
              {["Primary", "Social", "Promotions"].map((tab, i) => (
                <div
                  key={tab}
                  style={{
                    padding: "6px 14px", borderRadius: 20,
                    fontSize: 13,
                    border: "1px solid #dadce0",
                    background: "#fff",
                    color: i === 0 ? "#202124" : "#9aa0a6",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Email rows */}
            {MOCK_EMAILS.map((email, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 16px",
                  borderBottom: "0.5px solid #f1f3f4",
                  fontSize: 13,
                  cursor: "pointer",
                  position: "relative",
                  fontWeight: email.unread ? 500 : 400,
                  animation: `emailFloat 4s ${email.delay} ease-in-out infinite`,
                }}
              >
                {email.unread && (
                  <div style={{
                    position: "absolute", left: 5, top: "50%",
                    transform: "translateY(-50%)",
                    width: 4, height: 4,
                    borderRadius: "50%", background: "#1a73e8",
                  }} />
                )}
                <span style={{ width: 110, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#202124" }}>
                  {email.sender}
                </span>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#444746" }}>
                    {email.subject}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: email.aiColor || "#1a73e8", marginTop: 2 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill={email.aiColor || "#1a73e8"}>
                      <polygon points="5,1 6.5,4 10,4.5 7.5,7 8,10 5,8.5 2,10 2.5,7 0,4.5 3.5,4"/>
                    </svg>
                    {email.ai}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: "2px 8px",
                  borderRadius: 12, flexShrink: 0, ...email.tagStyle,
                }}>
                  {email.tag}
                </span>
                <span style={{ width: 50, textAlign: "right", flexShrink: 0, fontSize: 12, color: "#9aa0a6" }}>
                  {email.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes emailFloat {
          0%   { opacity:0; transform:translateY(8px); }
          15%  { opacity:1; transform:translateY(0); }
          55%  { opacity:1; transform:translateY(-4px); }
          72%  { opacity:0; transform:translateY(-16px); }
          100% { opacity:0; transform:translateY(-16px); }
        }
        @keyframes floatMockup {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

export function HeroSection({ onSignIn }) {
  return (
    <section
      id="top"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "100px 24px 80px",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundRings />
      <EyebrowBadge />

      <h1
        style={{
          fontFamily: "'Google Sans Display', sans-serif",
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          fontWeight: 700,
          lineHeight: 1.08,
          color: "#202124",
          letterSpacing: "-0.03em",
          maxWidth: 760,
          marginBottom: 24,
          position: "relative",
          zIndex: 1,
          animation: "fadeUp 0.6s 0.1s ease both",
        }}
      >
        Email is chaos.{" "}
        <span style={{ color: "#1a73e8" }}>Mailware</span>{" "}
        brings{" "}
        <span style={{ color: "#34a853" }}>order.</span>
      </h1>

      <p
        style={{
          fontSize: "1.125rem",
          color: "#5f6368",
          lineHeight: 1.7,
          maxWidth: 540,
          margin: "0 auto 40px",
          position: "relative",
          zIndex: 1,
          animation: "fadeUp 0.6s 0.2s ease both",
        }}
      >
        Mailware reads your inbox and automatically extracts actionable tasks —
        so you never miss a deadline buried in a thread again.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          position: "relative",
          zIndex: 1,
          animation: "fadeUp 0.6s 0.3s ease both",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ minWidth: 280 }}>
          <GoogleSignInButton
            onSuccess={onSignIn}
            label="Get started with Google"
          />
        </div>
        <a
          href="#features"
          style={{
            padding: "14px 28px",
            color: "#1a73e8",
            borderRadius: 28,
            fontSize: 15,
            fontWeight: 500,
            border: "1.5px solid #dadce0",
            background: "#fff",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8f9fa";
            e.currentTarget.style.borderColor = "#bdc1c6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#dadce0";
          }}
        >
          See how it works
        </a>
      </div>

      {/* Trust badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginTop: 52,
          position: "relative",
          zIndex: 1,
          animation: "fadeUp 0.6s 0.4s ease both",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {TRUST_ITEMS.map(({ label, icon }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#9aa0a6" }}
          >
            {icon}
            {label}
          </div>
        ))}
      </div>

      <InboxMockup />

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </section>
  );
}

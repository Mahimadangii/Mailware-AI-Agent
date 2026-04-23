// src/components/LandingPage.jsx
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { LogosStrip, FeaturesSection, HowItWorks, StatsSection, TestimonialsSection } from "./Sections";
import { CtaSection, Footer } from "./CtaAndFooter";

/**
 * LandingPage — assembles every section in order.
 * @param {function} onSignIn - called with Firebase user after auth
 */
export function LandingPage({ onSignIn }) {
  return (
    <div style={{ overflowX: "hidden" }}>
      <Navbar onSignIn={onSignIn} />
      <HeroSection onSignIn={onSignIn} />
      <LogosStrip />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection onSignIn={onSignIn} />
      <Footer />
    </div>
  );
}

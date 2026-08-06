"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import LandingToolsGrid from "@/components/LandingToolsGrid";
import ScreenLoader from "@/components/ScreenLoader";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/contexts/ToastContext";
import { consumePendingUpgrade } from "@/lib/upgrade/intent";
import { useFreeDailyLimit } from "@/hooks/useFreeDailyLimit";
import { TOOLS } from "@/data/tools";

const AuthModal = dynamic(() => import("@/components/AuthModal"), { ssr: false });

// Real, existing tool entries — used to give the new hero showcase panel
// authentic content instead of fabricated stats/numbers.
const showcaseTool = TOOLS.find((t) => t.id === "hook") || TOOLS[0];
const showcaseToolSecondary = TOOLS.find((t) => t.id === "script") || TOOLS[1];

const TRUSTED_PLATFORMS = ["YouTube", "Instagram", "TikTok", "Reels", "Shorts"];

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const { user, loading } = useSession();
  const freeDailyLimit = useFreeDailyLimit();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(consumePendingUpgrade() ? "/profile?upgrade=1" : "/home");
    }
  }, [loading, user, router]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("creatoros_suspended") === "1") {
        sessionStorage.removeItem("creatoros_suspended");
        showToast("Your account has been suspended. Contact support for help.");
      }
    } catch {
      // non-critical
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAuth(tab: "login" | "signup") {
    setAuthTab(tab);
    setAuthOpen(true);
  }

  function scrollToTools() {
    document.getElementById("landingToolsSection")?.scrollIntoView({ behavior: "smooth" });
  }

  if (loading || user) return <ScreenLoader />;

  return (
    <div className="screen active" id="screen-landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "CreatorOS Studio AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "AI content creation platform for creators — 21 AI tools for scripts, hooks, captions, hashtags, CTAs, and an AI chat assistant.",
            offers: [
              { "@type": "Offer", name: "Free", price: "0", priceCurrency: "INR" },
              { "@type": "Offer", name: "Pro", price: "299", priceCurrency: "INR" },
            ],
          }),
        }}
      />
      <AuthModal isOpen={authOpen} initialTab={authTab} onClose={() => setAuthOpen(false)} />

      <nav className="landing-nav">
        <div className="landing-logo">CreatorOS Studio AI</div>
        <div className="landing-nav-actions">
          <button className="landing-signup-btn" onClick={() => openAuth("signup")}>
            Sign Up
          </button>
          <button className="landing-signin-btn" onClick={() => openAuth("login")}>
            Sign In
          </button>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-3" aria-hidden="true" />

        <div className="hero-grid">
          <div className="hero-left">
            <div className="hero-tag">✦ AI-Powered for Creators</div>
            <h1 className="hero-h1">
              Create <span>Viral Content</span>
              <br />
              with AI
            </h1>
            <p className="hero-p">
              Generate hooks, scripts, captions, hashtags and more in seconds. Free to join — no credit card needed.
            </p>
            <div className="hero-btns">
              <button className="btn-grad" onClick={() => openAuth("signup")}>
                Get Started Free →
              </button>
              <button className="btn-outline" onClick={scrollToTools}>
                Explore Tools
              </button>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true">
            <div className="hero-showcase">
              <div className="hs-card hs-card-main">
                <div className="hs-card-dot" />
                <div className="hs-card-header">
                  <span className="hs-card-icon">{showcaseTool.icon}</span>
                  <span className="hs-card-title">{showcaseTool.name}</span>
                </div>
                <div className="hs-line hs-line-1" />
                <div className="hs-line hs-line-2" />
                <div className="hs-line hs-line-3" />
                <div className="hs-card-footer">
                  <span className="hs-badge">✨ Generating</span>
                </div>
              </div>

              <div className="hs-card hs-card-float hs-card-float-1">
                <span className="hs-card-icon">{showcaseToolSecondary.icon}</span>
                <span className="hs-float-label">{showcaseToolSecondary.name}</span>
              </div>

              <div className="hs-card hs-card-float hs-card-float-2">
                <span className="hs-check">✓</span>
                <span className="hs-float-label">Saved to Library</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-stats">
        <div className="ls-item">
          <div className="ls-num">20+</div>
          <div className="ls-label">AI Tools</div>
        </div>
        <div className="ls-item">
          <div className="ls-num">{freeDailyLimit}</div>
          <div className="ls-label">Free/Day</div>
        </div>
        <div className="ls-item">
          <div className="ls-num">∞</div>
          <div className="ls-label">Pro Plan</div>
        </div>
        <div className="ls-item">
          <div className="ls-num">100%</div>
          <div className="ls-label">Free to Join</div>
        </div>
      </div>

      <div className="landing-trusted">
        <div className="lt-label">Built for creators on</div>
        <div className="lt-platforms">
          {TRUSTED_PLATFORMS.map((p) => (
            <span className="lt-platform" key={p}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="landing-tools-section" id="landingToolsSection">
        <h2>All AI Tools</h2>
        <p>Everything a content creator needs — in one place.</p>
        <LandingToolsGrid onToolClick={() => openAuth("signup")} />
      </div>

      <div className="landing-cta-section">
        <h2>Start Creating for Free</h2>
        <p>Join thousands of creators using AI to grow faster.</p>
        <button className="btn-grad" onClick={() => openAuth("signup")}>
          Create Free Account →
        </button>
      </div>

      <footer className="landing-footer">
        <span className="landing-footer-logo">CreatorOS Studio AI</span>
        <div className="landing-footer-links">
          <Link className="lfl" href="/about">
            About
          </Link>
          <Link className="lfl" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="lfl" href="/terms">
            Terms
          </Link>
          <Link className="lfl" href="/refund-policy">
            Refund Policy
          </Link>
          <Link className="lfl" href="/cookie-policy">
            Cookie Policy
          </Link>
          <Link className="lfl" href="/contact">
            Contact
          </Link>
        </div>
        <div className="landing-footer-copy">
          <span>© 2026 CreatorOS Studio AI. All Rights Reserved.</span>
          <span>Made for Content Creators 🇮🇳 · Powered by CreatorOS Studio AI · v1.0</span>
        </div>
      </footer>
    </div>
  );
}

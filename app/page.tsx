"use client";

import { useState, useEffect, useRef } from "react";
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

const TRUST_BADGES = [
  { icon: "⚡", label: "Fast AI Generation" },
  { icon: "🔒", label: "Secure & Private" },
  { icon: "📱", label: "Mobile Optimized" },
  { icon: "🌍", label: "Available Everywhere" },
];

const PREVIEW_TOOL_IDS = ["hook", "script", "caption", "calendar"];
const PREVIEW_TOOLS = PREVIEW_TOOL_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(
  (t): t is (typeof TOOLS)[number] => Boolean(t)
);

const WHY_CARDS = [
  { icon: "⚡", label: "Lightning Fast", desc: "Get results in seconds, not hours." },
  { icon: "🤖", label: "AI Powered", desc: "Built on models tuned for creators." },
  { icon: "📱", label: "Mobile Optimized", desc: "Create on the go, from any device." },
  { icon: "🔥", label: "Viral Content Ready", desc: "Formats built for how people scroll." },
];

const DEMO_CAPTION = "POV: you finally found the AI tool that gets your content style 🎯 Save this for later ✨ #ContentCreator";

const TESTIMONIALS = [
  { name: "Ananya", initial: "A", role: "Content Creator", quote: "Saved me hours every week." },
  { name: "Rohan", initial: "R", role: "YouTube Creator", quote: "Best AI workspace for creators." },
  { name: "Priya", initial: "P", role: "Instagram Creator", quote: "Worth every rupee." },
];

// Deterministic (not Math.random()) so server-rendered and
// client-hydrated markup match exactly — random values generated
// during render are a classic Next.js hydration-mismatch bug.
const HERO_PARTICLES = [
  { left: "8%", bottom: "10%", size: "3px", duration: "7s", delay: "0s" },
  { left: "22%", bottom: "5%", size: "2px", duration: "9s", delay: "1.2s" },
  { left: "38%", bottom: "15%", size: "4px", duration: "8s", delay: "2.4s" },
  { left: "55%", bottom: "8%", size: "2px", duration: "10s", delay: ".6s" },
  { left: "68%", bottom: "20%", size: "3px", duration: "7.5s", delay: "3s" },
  { left: "82%", bottom: "6%", size: "2px", duration: "9.5s", delay: "1.8s" },
  { left: "92%", bottom: "14%", size: "3px", duration: "8.5s", delay: "4s" },
];

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [demoText, setDemoText] = useState("");
  const [demoTyping, setDemoTyping] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setPreviewIndex((i) => (i + 1) % PREVIEW_TOOLS.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let charIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeNext() {
      if (charIndex <= DEMO_CAPTION.length) {
        setDemoText(DEMO_CAPTION.slice(0, charIndex));
        setDemoTyping(true);
        charIndex++;
        timeoutId = setTimeout(typeNext, 35);
      } else {
        setDemoTyping(false);
        timeoutId = setTimeout(() => {
          charIndex = 0;
          typeNext();
        }, 3200);
      }
    }
    typeNext();
    return () => clearTimeout(timeoutId);
  }, []);
  const { user, loading } = useSession();
  const freeDailyLimit = useFreeDailyLimit();
  const { showToast } = useToast();
  const router = useRouter();
  const showcaseRef = useRef<HTMLDivElement>(null);
  const statRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    const els = statRefs.map((r) => r.current).filter((el): el is HTMLDivElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLDivElement;
          const target = parseInt(el.dataset.countTo || "0", 10);
          const suffix = el.dataset.suffix || "";
          const duration = 900;
          const start = performance.now();
          function tick(now: number) {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${Math.round(target * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeDailyLimit]);

  function handleHeroParallax(e: React.MouseEvent<HTMLDivElement>) {
    const el = showcaseRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    // Directly mutate a CSS custom property instead of React state —
    // avoids a re-render on every mousemove, keeping this smooth and
    // lightweight per the performance requirement.
    el.style.setProperty("--px", String(relX * -14));
    el.style.setProperty("--py", String(relY * -10));
  }

  function resetHeroParallax() {
    const el = showcaseRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
  }

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

  useEffect(() => {
    const els = document.querySelectorAll(".reveal-up");
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollToTools() {
    document.getElementById("landingToolsSection")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToPricing() {
    document.getElementById("pricingSection")?.scrollIntoView({ behavior: "smooth" });
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
        <div className="landing-logo">
          CreatorOS <span>Studio AI</span>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-signup-btn" onClick={() => openAuth("signup")}>
            Sign Up
          </button>
          <button className="landing-signin-btn" onClick={() => openAuth("login")}>
            Sign In
          </button>
        </div>
      </nav>

      <div className="hero-section" onMouseMove={handleHeroParallax} onMouseLeave={resetHeroParallax}>
        <div className="hero-aurora" aria-hidden="true" />
        {HERO_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="hero-particle"
            aria-hidden="true"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
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
            <div className="hero-showcase" ref={showcaseRef}>
              <div className="hero-showcase-reflection" />
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
          <div className="ls-num" ref={statRefs[0]} data-count-to="20" data-suffix="+">
            0
          </div>
          <div className="ls-label">AI Tools</div>
        </div>
        <div className="ls-item">
          <div className="ls-num" ref={statRefs[1]} data-count-to={String(freeDailyLimit)}>
            0
          </div>
          <div className="ls-label">Free/Day</div>
        </div>
        <div className="ls-item">
          <div className="ls-num">∞</div>
          <div className="ls-label">Pro Plan</div>
        </div>
        <div className="ls-item">
          <div className="ls-num" ref={statRefs[2]} data-count-to="100" data-suffix="%">
            0
          </div>
          <div className="ls-label">Free to Join</div>
        </div>
      </div>

      <div className="trust-strip">
        {TRUST_BADGES.map((b) => (
          <div className="trust-badge" key={b.label}>
            <span className="trust-badge-icon">{b.icon}</span>
            <span>{b.label}</span>
          </div>
        ))}
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

      <div className="ai-preview-section reveal-up">
        <h2>See It In Action</h2>
        <p>A live look at the tools creators use every day.</p>
        <div className="ai-preview-carousel">
          {PREVIEW_TOOLS.map((t, i) => (
            <div key={t.id} className={`ai-preview-card ${i === previewIndex ? "active" : ""}`}>
              <div className="apc-icon">{t.icon}</div>
              <div className="apc-name">{t.name}</div>
            </div>
          ))}
        </div>
        <div className="ai-preview-dots">
          {PREVIEW_TOOLS.map((t, i) => (
            <span key={t.id} className={`apd-dot ${i === previewIndex ? "active" : ""}`} />
          ))}
        </div>
      </div>

      <div className="why-section reveal-up">
        <h2>Why CreatorOS Studio AI</h2>
        <div className="why-grid">
          {WHY_CARDS.map((c) => (
            <div className="why-card" key={c.label}>
              <div className="why-icon">{c.icon}</div>
              <div className="why-label">{c.label}</div>
              <div className="why-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-demo-section reveal-up">
        <h2>Watch AI Create in Real Time</h2>
        <div className="ai-demo-card">
          <div className="ai-demo-row ai-demo-prompt">
            <span className="ai-demo-label">Prompt</span>
            <span className="ai-demo-text">Write a viral Instagram Reel caption.</span>
          </div>
          <div className="ai-demo-arrow">↓</div>
          <div className="ai-demo-row ai-demo-output">
            <span className="ai-demo-label">CreatorOS AI</span>
            <span className="ai-demo-text">
              {demoText}
              {demoTyping && <span className="ai-demo-cursor" />}
            </span>
          </div>
        </div>
        <p className="ai-demo-note">Demo preview — try it for real after you sign up.</p>
      </div>

      <div className="testimonials-section reveal-up">
        <h2>Loved by Creators</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="tc-stars">⭐⭐⭐⭐⭐</div>
              <p className="tc-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="tc-author">
                <div className="tc-avatar">{t.initial}</div>
                <div>
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-preview-section reveal-up" id="pricingSection">
        <h2>Simple Pricing</h2>
        <p>Start free. Upgrade when you&apos;re ready.</p>
        <div className="pricing-preview-grid">
          <div className="pp-card">
            <div className="pp-name">Free</div>
            <div className="pp-price">
              ₹0<span>/mo</span>
            </div>
            <ul className="pp-features">
              <li>{freeDailyLimit} generations / day</li>
              <li>All 20+ AI tools</li>
              <li>Save to Library</li>
            </ul>
            <button className="pp-btn-outline" onClick={() => openAuth("signup")}>
              Get Started
            </button>
          </div>
          <div className="pp-card pp-card-featured">
            <div className="pp-badge">Most Popular</div>
            <div className="pp-name">Pro</div>
            <div className="pp-price">
              ₹299<span>/mo</span>
            </div>
            <ul className="pp-features">
              <li>Unlimited generations</li>
              <li>All 20+ AI tools</li>
              <li>Priority AI Chat</li>
              <li>Save to Library</li>
            </ul>
            <button className="pp-btn-filled" onClick={() => openAuth("signup")}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      <div className="landing-tools-section reveal-up" id="landingToolsSection">
        <h2>All AI Tools</h2>
        <p>Everything a content creator needs — in one place.</p>
        <LandingToolsGrid onToolClick={() => openAuth("signup")} />
      </div>

      <div className="landing-cta-section reveal-up">
        <h2>Start Creating for Free</h2>
        <p>Join thousands of creators using AI to grow faster.</p>
        <button className="btn-grad" onClick={() => openAuth("signup")}>
          Create Free Account →
        </button>
      </div>

      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              CreatorOS <span>Studio AI</span>
            </div>
            <p className="footer-tagline">AI Workspace for Modern Content Creators.</p>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <button className="flink" onClick={() => openAuth("signup")}>
              Get Started
            </button>
            <button className="flink" onClick={scrollToTools}>
              AI Tools
            </button>
            <button className="flink" onClick={() => openAuth("login")}>
              Sign In
            </button>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <Link className="flink" href="/about">
              About
            </Link>
            <Link className="flink" href="/contact">
              Contact
            </Link>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Resources</div>
            <Link className="flink" href="/contact">
              Support
            </Link>
            <button className="flink" onClick={scrollToPricing}>
              Pricing
            </button>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <Link className="flink" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="flink" href="/terms">
              Terms
            </Link>
            <Link className="flink" href="/refund-policy">
              Refund Policy
            </Link>
            <Link className="flink" href="/cookie-policy">
              Cookie Policy
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 CreatorOS Studio AI</span>
          <span>Made with ❤️ for Content Creators 🇮🇳</span>
          <span>Version 1.0</span>
        </div>
      </footer>
    </div>
  );
}

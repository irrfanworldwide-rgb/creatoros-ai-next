"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSession } from "@/contexts/SessionContext";
import BottomNav from "@/components/BottomNav";
import ScreenLoader from "@/components/ScreenLoader";
import { TOOLS, TIPS } from "@/data/tools";
import { useUpgradeFlow } from "@/hooks/useUpgradeFlow";
import { useFreeDailyLimit } from "@/hooks/useFreeDailyLimit";
import { createRipple } from "@/lib/ui/ripple";

export default function HomePage() {
  const { user, loading } = useRequireAuth();
  const { profile, usageToday } = useSession();
  const router = useRouter();
  const { goToUpgrade } = useUpgradeFlow();
  const freeDailyLimit = useFreeDailyLimit();

  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);
  const recentTools = TOOLS.slice(0, 6);
  const quickActionTools = [
    { id: "script", icon: "🎬", label: "Script Writer", desc: "Write engaging video scripts" },
    { id: "hook", icon: "🪝", label: "Hook Generator", desc: "Create viral hooks that grab attention" },
    { id: "caption", icon: "✍️", label: "Caption Writer", desc: "Write scroll-stopping captions" },
  ];

  if (loading || !user) return <ScreenLoader />;

  const plan = profile?.plan ?? "free";
  const displayName = user.email?.split("@")[0] ?? "Creator";
  const initial = displayName.charAt(0).toUpperCase();
  // Same usageToday/freeDailyLimit values already used elsewhere — just
  // also expressed as a ring percentage for the new progress visual.
  const usagePercent = plan === "pro" ? 100 : Math.min(100, Math.round((usageToday / freeDailyLimit) * 100));

  return (
    <div className="screen active">
      <header className="dash-header">
        <div className="dash-greeting">
          <div className="dash-greeting-top">Welcome back,</div>
          <h1>
            {displayName} <span className="dash-wave">👋</span>
          </h1>
          <div className="dash-greeting-sub">What will you create today?</div>
        </div>
        <div className="dash-header-right">
          {plan === "free" && (
            <button className="dash-upgrade-pill" onClick={goToUpgrade}>
              👑 Upgrade to Pro
            </button>
          )}
          <button className="dash-icon-btn" onClick={() => router.push("/library")} aria-label="Library">
            📚
          </button>
          <div className="dash-avatar" onClick={() => router.push("/profile")}>
            {initial}
          </div>
        </div>
      </header>

      <div className="hero-card">
        <div className="hero-card-sparkle hero-card-sparkle-1" aria-hidden="true">
          ✦
        </div>
        <div className="hero-card-sparkle hero-card-sparkle-2" aria-hidden="true">
          ✦
        </div>
        <div className="hero-card-grid">
          <div className="hero-card-left">
            <div className="hc-tag">✦ AI-Powered</div>
            <div className="hc-title">
              Create something <span>great</span> today
            </div>
            <div className="hc-sub">Pick a tool and generate in seconds.</div>
            <div className="hc-btns">
              <button className="hc-btn-white" onClick={() => router.push("/tools")}>
                Browse Tools
              </button>
              <button className="hc-btn-outline" onClick={() => router.push("/chat")}>
                Open AI Chat
              </button>
            </div>
          </div>
          <div className="hero-card-right" aria-hidden="true">
            <div className="hc-visual">
              <div className="hc-visual-orbit" />
              <div className="hc-visual-core">AI</div>
              <div className="hc-visual-chip hc-visual-chip-1" />
              <div className="hc-visual-chip hc-visual-chip-2" />
              <div className="hc-visual-chip hc-visual-chip-3" />
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-ring">
          <div className="sc-label">
            <span className="sc-icon">⚡</span> Today
          </div>
          <div className="sc-ring-row">
            <div>
              <div className="sc-value">
                {plan === "pro" ? usageToday : `${usageToday}/${freeDailyLimit}`}
              </div>
              <div className="sc-sub">generations used</div>
            </div>
            <div
              className="sc-ring"
              style={{ ["--ring-pct" as string]: `${usagePercent}%` }}
              aria-hidden="true"
            >
              <span className="sc-ring-label">{usagePercent}%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="sc-label">
            <span className="sc-icon">💎</span> Plan
          </div>
          <div className="sc-value">{plan === "pro" ? "Pro" : "Free"}</div>
          <div className="sc-sub">{plan === "pro" ? "Unlimited access" : `${freeDailyLimit} free / day`}</div>
          {plan === "free" && (
            <button className="sc-upgrade-btn" onClick={goToUpgrade}>
              Upgrade
            </button>
          )}
        </div>
      </div>

      <div className="section-hdr">
        <h2>Quick Actions</h2>
      </div>
      <div className="quick-actions">
        {quickActionTools.map((qa) => (
          <div key={qa.id} className="qa-item" onClick={() => router.push(`/tools/${qa.id}`)}>
            <div className="qa-icon">{qa.icon}</div>
            <div className="qa-text">
              <div className="qa-label">{qa.label}</div>
              <div className="qa-desc">{qa.desc}</div>
            </div>
            <span className="qa-arrow" aria-hidden="true">
              →
            </span>
          </div>
        ))}
      </div>

      <div className="section-hdr">
        <h2>Popular Tools</h2>
        <button className="section-hdr-link" onClick={() => router.push("/tools")}>
          See all
        </button>
      </div>
      <div className="rtc-grid">
        {recentTools.map((t) => (
          <div key={t.id} className="recent-tool-card" onClick={() => router.push(`/tools/${t.id}`)}>
            {t.badge && <div className="rtc-badge">{t.badge}</div>}
            <div className="rtc-icon">{t.icon}</div>
            <div className="rtc-name">{t.name}</div>
            <div className="rtc-desc">{t.desc}</div>
            <span className="rtc-action">Use tool →</span>
          </div>
        ))}
      </div>

      <div className="tip-card">
        <div className="tip-icon" aria-hidden="true">
          💡
        </div>
        <div className="tip-body">
          <div className="tip-label">Creator Tip</div>
          <div className="tip-text">{tip}</div>
        </div>
      </div>

      {plan === "free" && (
        <div className="upgrade-banner">
          <div className="ub-rocket" aria-hidden="true">
            🚀
          </div>
          <div className="ub-left">
            <h3>Go unlimited</h3>
            <p>Upgrade to Pro for unlimited generations.</p>
          </div>
          <button
            className="ub-btn ripple-container"
            onClick={(e) => {
              createRipple(e);
              goToUpgrade();
            }}
          >
            Upgrade Now →
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

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

  if (loading || !user) return <ScreenLoader />;

  const plan = profile?.plan ?? "free";
  const displayName = user.email?.split("@")[0] ?? "Creator";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="screen active">
      <header className="dash-header">
        <div className="dash-greeting">
          <div className="dash-greeting-top">Welcome back</div>
          <h1>{displayName}</h1>
        </div>
        <div className="dash-header-right">
          <button className="dash-icon-btn" onClick={() => router.push("/library")} aria-label="Library">
            📚
          </button>
          <div className="dash-avatar" onClick={() => router.push("/profile")}>
            {initial}
          </div>
        </div>
      </header>

      <div className="hero-card">
        <div className="hc-tag">✦ AI-Powered</div>
        <div className="hc-title">Create something great today</div>
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

      <div className="stats-grid">
        <div className="stat-card">
          <div className="sc-label">
            <span className="sc-icon">⚡</span> Today
          </div>
          <div className="sc-value">
            {plan === "pro" ? usageToday : `${usageToday}/${freeDailyLimit}`}
          </div>
          <div className="sc-sub">generations used</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">
            <span className="sc-icon">💎</span> Plan
          </div>
          <div className="sc-value">{plan === "pro" ? "Pro" : "Free"}</div>
          <div className="sc-sub">{plan === "pro" ? "Unlimited access" : `${freeDailyLimit} free / day`}</div>
        </div>
      </div>

      <div className="section-hdr">
        <h2>Quick Actions</h2>
      </div>
      <div className="quick-actions">
        <div className="qa-item" onClick={() => router.push("/tools/script")}>
          <div className="qa-icon">🎬</div>
          <div className="qa-label">Script</div>
        </div>
        <div className="qa-item" onClick={() => router.push("/tools/hook")}>
          <div className="qa-icon">🪝</div>
          <div className="qa-label">Hooks</div>
        </div>
        <div className="qa-item" onClick={() => router.push("/tools/caption")}>
          <div className="qa-icon">✍️</div>
          <div className="qa-label">Captions</div>
        </div>
      </div>

      <div className="section-hdr">
        <h2>Popular Tools</h2>
        <button className="section-hdr-link" onClick={() => router.push("/tools")}>
          See all
        </button>
      </div>
      <div className="hscroll-wrap">
        <div className="hscroll">
          {recentTools.map((t) => (
            <div key={t.id} className="recent-tool-card" onClick={() => router.push(`/tools/${t.id}`)}>
              <div className="rtc-icon">{t.icon}</div>
              <div className="rtc-name">{t.name}</div>
              <div className="rtc-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="tip-card">
        <div className="tip-label">💡 Creator Tip</div>
        <div className="tip-text">{tip}</div>
      </div>

      {plan === "free" && (
        <div className="upgrade-banner">
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
            Upgrade
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSession } from "@/contexts/SessionContext";
import BottomNav from "@/components/BottomNav";
import ScreenLoader from "@/components/ScreenLoader";
import { useToast } from "@/contexts/ToastContext";
import { createRipple } from "@/lib/ui/ripple";

const SubscriptionModal = dynamic(() => import("@/components/SubscriptionModal"), { ssr: false });

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const { profile, signOut } = useSession();
  const router = useRouter();
  const [subOpen, setSubOpen] = useState(false);
  const { showToast } = useToast();

  // Reached via the shared upgrade flow (Tool Detail limit, Chat limit,
  // Home banner) — auto-open the modal, then clean the URL. Reading
  // window.location directly (rather than useSearchParams) avoids the
  // App Router's Suspense-boundary requirement for a one-time check.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("upgrade") === "1") {
      setSubOpen(true);
      router.replace("/profile");
    }
  }, [router]);

  if (loading || !user) return <ScreenLoader />;

  const plan = profile?.plan ?? "free";
  const subStatus = profile?.subscription_status ?? null;
  const hasSubscription = !!profile?.razorpay_subscription_id;
  const isCancelling = subStatus === "cancelled"; // pending cancel-at-cycle-end, still has access
  const nextBillingLabel = profile?.subscription_current_end
    ? new Date(profile.subscription_current_end).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;

  const displayName = user.email?.split("@")[0] ?? "Creator";
  const initial = displayName.charAt(0).toUpperCase();

  async function handleLogout() {
    await signOut();
    showToast("Logged out");
    router.replace("/");
  }

  return (
    <div className="screen active">
      <SubscriptionModal isOpen={subOpen} onClose={() => setSubOpen(false)} />

      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-name">{displayName}</div>
        <div className="profile-email">{user.email}</div>
        <div className={`plan-badge ${plan}`}>{plan === "pro" ? "⭐ Pro Plan" : "Free Plan"}</div>
      </div>

      <div className="profile-sections">
        {plan === "free" && (
          <div className="upgrade-card-prof">
            <div className="ucp-left">
              <h3>Go unlimited</h3>
              <p>Upgrade to Pro for unlimited generations.</p>
            </div>
            <button
              className="ucp-btn ripple-container"
              onClick={(e) => {
                createRipple(e);
                setSubOpen(true);
              }}
            >
              Upgrade
            </button>
          </div>
        )}

        {plan === "pro" && hasSubscription && (
          <div className="prof-section">
            <div className="prof-section-title">Subscription</div>
            <div className="prof-row">
              <div className="prof-row-left">
                <span className="prof-row-icon">💎</span>
                <span className="prof-row-label">Current Plan</span>
              </div>
              <span className="prof-row-value">Pro — ₹299/mo</span>
            </div>
            <div className="prof-row">
              <div className="prof-row-left">
                <span className="prof-row-icon">📶</span>
                <span className="prof-row-label">Status</span>
              </div>
              <span className="prof-row-value">
                {isCancelling ? "Active (ending soon)" : subStatus === "pending" ? "Payment issue" : "Active"}
              </span>
            </div>
            {nextBillingLabel && (
              <div className="prof-row">
                <div className="prof-row-left">
                  <span className="prof-row-icon">📅</span>
                  <span className="prof-row-label">{isCancelling ? "Access ends" : "Next billing date"}</span>
                </div>
                <span className="prof-row-value">{nextBillingLabel}</span>
              </div>
            )}
            {subStatus === "pending" && (
              <div className="sub-limit-note" style={{ margin: ".75rem 1rem" }}>
                Your last renewal payment failed. Razorpay will retry automatically — update your payment
                method with your bank if this continues, or contact support.
              </div>
            )}
          </div>
        )}

        <div className="prof-section">
          <div className="prof-section-title">Account</div>
          <div className="prof-row" onClick={() => router.push("/library")}>
            <div className="prof-row-left">
              <span className="prof-row-icon">📚</span>
              <span className="prof-row-label">Saved Generations</span>
            </div>
            <span className="prof-chevron">›</span>
          </div>
          <div className="prof-row" onClick={() => setSubOpen(true)}>
            <div className="prof-row-left">
              <span className="prof-row-icon">💎</span>
              <span className="prof-row-label">Manage Plan</span>
            </div>
            <div className="prof-row-right">
              <span className="prof-row-value">{plan === "pro" ? "Pro" : "Free"}</span>
              <span className="prof-chevron">›</span>
            </div>
          </div>
        </div>

        <div className="prof-section">
          <div className="prof-section-title">Support & Legal</div>
          <div className="prof-row" onClick={() => router.push("/contact")}>
            <div className="prof-row-left">
              <span className="prof-row-icon">✉️</span>
              <span className="prof-row-label">Contact Us</span>
            </div>
            <span className="prof-chevron">›</span>
          </div>
          <div className="prof-row" onClick={() => router.push("/privacy")}>
            <div className="prof-row-left">
              <span className="prof-row-icon">🔒</span>
              <span className="prof-row-label">Privacy Policy</span>
            </div>
            <span className="prof-chevron">›</span>
          </div>
          <div className="prof-row" onClick={() => router.push("/terms")}>
            <div className="prof-row-left">
              <span className="prof-row-icon">📄</span>
              <span className="prof-row-label">Terms of Use</span>
            </div>
            <span className="prof-chevron">›</span>
          </div>
          <div className="prof-row" onClick={() => router.push("/refund-policy")}>
            <div className="prof-row-left">
              <span className="prof-row-icon">💳</span>
              <span className="prof-row-label">Refund Policy</span>
            </div>
            <span className="prof-chevron">›</span>
          </div>
          <div className="prof-row" onClick={() => router.push("/cookie-policy")}>
            <div className="prof-row-left">
              <span className="prof-row-icon">🍪</span>
              <span className="prof-row-label">Cookie Policy</span>
            </div>
            <span className="prof-chevron">›</span>
          </div>
          <div className="prof-row" onClick={() => router.push("/about")}>
            <div className="prof-row-left">
              <span className="prof-row-icon">ℹ️</span>
              <span className="prof-row-label">About Us</span>
            </div>
            <span className="prof-chevron">›</span>
          </div>
        </div>

        <div className="logout-row" onClick={handleLogout}>
          <span>🚪</span>
          <span>Log Out</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

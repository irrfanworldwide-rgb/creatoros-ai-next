"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadRazorpayScript } from "@/lib/razorpay/loadScript";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/contexts/ToastContext";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user, refreshProfile } = useSession();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleUpgradeClick() {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      const scriptReady = await loadRazorpayScript();
      const RazorpayCtor = window.Razorpay;
      if (!scriptReady || !RazorpayCtor) {
        setError("Could not load the payment form. Check your connection and try again.");
        setSubmitting(false);
        return;
      }

      const sb = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await sb.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError("Your session expired. Please sign in again.");
        setSubmitting(false);
        return;
      }

      const subRes = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const subData = await subRes.json();
      if (!subRes.ok) {
        setError(subData.error || "Could not start checkout. Please try again.");
        setSubmitting(false);
        return;
      }

      const razorpay = new RazorpayCtor({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subData.subscriptionId,
        name: "CreatorOS AI",
        description: "Pro Plan — ₹299/month, auto-renews until cancelled",
        prefill: { email: user.email || "" },
        theme: { color: "#7C3AED" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/payments/verify-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              setError(verifyData.error || "Payment verification failed. Contact support if you were charged.");
              setSubmitting(false);
              return;
            }
            await refreshProfile();
            showToast("Upgraded to Pro! 🎉");
            setSubmitting(false);
            onClose();
          } catch {
            setError("Payment verification failed. Contact support if you were charged.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      razorpay.open();
    } catch {
      setError("Something went wrong starting checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box glass-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={onClose}>
          ✕
        </div>
        <div className="sub-modal-hdr">
          <h2>Upgrade to Pro</h2>
          <p>Unlock unlimited generations and priority speed</p>
        </div>
        <div className="sub-plans">
          <div className="sub-plan">
            <div className="sp-name">Free</div>
            <div className="sp-price">
              ₹0<span>/mo</span>
            </div>
            <ul className="sp-features">
              <li>3 generations/day</li>
              <li>All 21 tools</li>
              <li>Basic support</li>
            </ul>
          </div>
          <div className="sub-plan featured">
            <div className="sp-name">Pro</div>
            <div className="sp-price">
              ₹299<span>/mo</span>
            </div>
            <ul className="sp-features">
              <li>Unlimited generations</li>
              <li>All 21 tools</li>
              <li>Priority support</li>
              <li>Save unlimited history</li>
            </ul>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text3)", textAlign: "center", margin: "0 1.25rem .75rem" }}>
          Auto-renews monthly at ₹299 until cancelled. Cancel anytime from your Profile.
        </p>
        {error && (
          <div className="sub-limit-note" style={{ margin: "0 1.25rem .5rem" }}>
            {error}
          </div>
        )}
        <div className="sub-modal-actions">
          <button className="sub-up-btn ripple-container" disabled={submitting} onClick={handleUpgradeClick}>
            {submitting ? "Please wait..." : "Subscribe to Pro — ₹299/mo"}
          </button>
          <button className="sub-skip-btn" onClick={onClose} disabled={submitting}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

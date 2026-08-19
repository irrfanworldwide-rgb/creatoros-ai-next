"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";

const RESEND_COOLDOWN_SECONDS = 45;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(true);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [verified, setVerified] = useState(false);

  // Reached from AuthModal/login with ?email=... pre-filled — read it
  // directly rather than via useSearchParams(), which avoids the App
  // Router's Suspense-boundary requirement for a one-time read (same
  // convention as the ?upgrade=1 check in app/profile/page.tsx).
  useEffect(() => {
    const prefill = new URLSearchParams(window.location.search).get("email");
    if (prefill) {
      setEmail(prefill);
      setEditingEmail(false);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleVerify() {
    if (!email || code.length !== 6) return;
    setVerifying(true);
    setMsg(null);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.verifyOtp({ email, token: code, type: "signup" });
    setVerifying(false);

    if (error) {
      // Supabase returns a generic error message for both wrong and
      // expired codes — surfacing its message directly here rather than
      // guessing which case it is.
      const isExpired = /expired/i.test(error.message);
      setMsg({
        text: isExpired
          ? "This code has expired. Request a new one below."
          : "That code isn't right. Please check and try again.",
        type: "error",
      });
      return;
    }

    setVerified(true);
    setMsg({ text: "Email verified successfully.", type: "success" });
    showToast("Email verified!");
    setTimeout(() => router.replace("/home"), 1200);
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setResending(true);
    setMsg(null);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.resend({ type: "signup", email });
    setResending(false);

    if (error) {
      setMsg({ text: error.message, type: "error" });
      return;
    }
    setMsg({ text: "A new code has been sent to your email.", type: "success" });
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="screen active" id="screen-verify-email">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Verify Email</div>
      </div>

      <div className="auth-header">
        <h2>Check your inbox</h2>
        <p>Enter the 6-digit code we sent to verify your account</p>
      </div>

      <div className="auth-body">
        {editingEmail ? (
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="verify-email-chip">
            <span>{email}</span>
            <button type="button" onClick={() => setEditingEmail(true)}>
              Change
            </button>
          </div>
        )}

        <input
          className="auth-input verify-otp-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          disabled={verified}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />

        <button
          className="auth-btn"
          disabled={verifying || verified || !email || code.length !== 6}
          onClick={handleVerify}
        >
          {verifying ? "Verifying..." : verified ? "Verified ✓" : "Verify"}
        </button>

        {msg && (
          <div className={`auth-msg ${msg.type}`} style={{ display: "block" }}>
            {msg.text}
          </div>
        )}

        {!verified && (
          <button className="verify-resend-btn" disabled={resending || cooldown > 0 || !email} onClick={handleResend}>
            {resending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        )}
      </div>
    </div>
  );
}

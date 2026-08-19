"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [done, setDone] = useState(false);

  // Reached from Forgot Password with ?email=... pre-filled — same
  // window.location.search convention as app/profile/page.tsx and
  // verify-email/page.tsx, avoiding the Suspense-boundary requirement
  // useSearchParams() would otherwise impose.
  useEffect(() => {
    const prefill = new URLSearchParams(window.location.search).get("email");
    if (prefill) setEmail(prefill);
  }, []);

  async function handleVerifyCode() {
    if (!email || code.length !== 6) return;
    setVerifying(true);
    setMsg(null);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.verifyOtp({ email, token: code, type: "recovery" });
    setVerifying(false);

    if (error) {
      const isExpired = /expired/i.test(error.message);
      setMsg({
        text: isExpired
          ? "This code has expired. Go back and request a new one."
          : "That code isn't right. Please check and try again.",
        type: "error",
      });
      return;
    }
    setCodeVerified(true);
    setMsg(null);
  }

  async function handleUpdatePassword() {
    if (password.length < 8) {
      setMsg({ text: "Password must be at least 8 characters.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setMsg({ text: "Passwords don't match.", type: "error" });
      return;
    }
    setUpdating(true);
    setMsg(null);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.updateUser({ password });
    setUpdating(false);

    if (error) {
      setMsg({ text: error.message, type: "error" });
      return;
    }

    setDone(true);
    setMsg({ text: "Password updated successfully.", type: "success" });
    showToast("Password updated!");
    // The recovery session established by verifyOtp is still active here —
    // sign out so the old flow doesn't leave them silently logged in via
    // a recovery session, and send them to a normal login instead.
    await sb.auth.signOut();
    setTimeout(() => router.replace("/"), 1500);
  }

  return (
    <div className="screen active" id="screen-reset-password">
      <div className="td-header">
        <Link className="td-back" href="/forgot-password">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Reset Password</div>
      </div>

      {!codeVerified ? (
        <>
          <div className="auth-header">
            <h2>Enter your code</h2>
            <p>Enter the 6-digit code sent to your email</p>
          </div>
          <div className="auth-body">
            <input
              className="auth-input"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="auth-input verify-otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <button className="auth-btn" disabled={verifying || !email || code.length !== 6} onClick={handleVerifyCode}>
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
            {msg && (
              <div className={`auth-msg ${msg.type}`} style={{ display: "block" }}>
                {msg.text}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="auth-header">
            <h2>Set a new password</h2>
            <p>Choose a new password for your account</p>
          </div>
          <div className="auth-body">
            <input
              className="auth-input"
              type="password"
              placeholder="New password (min 8 chars)"
              autoComplete="new-password"
              value={password}
              disabled={done}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={done}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              className="auth-btn"
              disabled={updating || done || !password || !confirmPassword}
              onClick={handleUpdatePassword}
            >
              {updating ? "Updating..." : done ? "Updated ✓" : "Update Password"}
            </button>
            {msg && (
              <div className={`auth-msg ${msg.type}`} style={{ display: "block" }}>
                {msg.text}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

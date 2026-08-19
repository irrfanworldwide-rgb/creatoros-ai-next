"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);

  async function handleSend() {
    if (!email) return;
    setSubmitting(true);
    setMsg(null);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.resetPasswordForEmail(email);
    setSubmitting(false);

    if (error) {
      setMsg({ text: error.message, type: "error" });
      return;
    }
    setMsg({ text: "A reset code has been sent to your email.", type: "success" });
    setTimeout(() => {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 900);
  }

  return (
    <div className="screen active" id="screen-forgot-password">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Forgot Password</div>
      </div>

      <div className="auth-header">
        <h2>Reset your password</h2>
        <p>Enter your email and we&apos;ll send you a code to reset it</p>
      </div>

      <div className="auth-body">
        <input
          className="auth-input"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <button className="auth-btn" disabled={submitting || !email} onClick={handleSend}>
          {submitting ? "Sending..." : "Send Reset Code"}
        </button>
        {msg && (
          <div className={`auth-msg ${msg.type}`} style={{ display: "block" }}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}

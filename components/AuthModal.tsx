"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type AuthTab = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  initialTab: AuthTab;
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialTab, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const { showToast } = useToast();
  const router = useRouter();
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  function reset() {
    setEmail("");
    setPassword("");
    setMsg(null);
  }

  function switchTab(t: AuthTab) {
    setTab(t);
    setMsg(null);
  }

  async function doLogin() {
    setSubmitting(true);
    setMsg(null);
    const sb = getSupabaseBrowserClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setMsg({ text: "Wrong email or password. Please try again.", type: "error" });
      return;
    }
    if (data.user && !data.user.email_confirmed_at) {
      const pendingEmail = email;
      reset();
      onClose();
      router.push(`/verify-email?email=${encodeURIComponent(pendingEmail)}`);
      return;
    }
    showToast("Welcome back!");
    reset();
    onClose();
  }

  async function doSignup() {
    if (password.length < 6) {
      setMsg({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) {
      setMsg({ text: error.message, type: "error" });
      return;
    }
    const pendingEmail = email;
    showToast("Verification code sent!");
    reset();
    onClose();
    router.push(`/verify-email?email=${encodeURIComponent(pendingEmail)}`);
  }

  async function doGoogle() {
    setSubmitting(true);
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    setSubmitting(false);
    if (error) setMsg({ text: error.message, type: "error" });
  }

  return (
    <div
      className="modal-overlay open"
      onClick={() => {
        reset();
        onClose();
      }}
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-close"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          ✕
        </div>
        <div className="auth-header">
          <h2>Welcome to CreatorOS Studio AI</h2>
          <p>Sign in to access all tools and save your work</p>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => switchTab("login")}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => switchTab("signup")}>
            Sign Up
          </button>
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
            className="auth-input"
            type="password"
            placeholder={tab === "signup" ? "Password (min 6 chars)" : "Password"}
            autoComplete={tab === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {tab === "login" && (
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => {
                const pendingEmail = email;
                reset();
                onClose();
                router.push(
                  pendingEmail ? `/forgot-password?email=${encodeURIComponent(pendingEmail)}` : "/forgot-password"
                );
              }}
            >
              Forgot password?
            </button>
          )}
          <button
            className="auth-btn"
            disabled={submitting || !email || !password}
            onClick={tab === "login" ? doLogin : doSignup}
          >
            {submitting ? "Please wait..." : tab === "login" ? "Sign In" : "Create Free Account"}
          </button>
          <div className="auth-divider">or</div>
          <button className="google-btn" disabled={submitting} onClick={doGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          {msg && (
            <div className={`auth-msg ${msg.type}`} style={{ display: "block" }}>
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

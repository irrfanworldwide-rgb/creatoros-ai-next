import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How CreatorOS Studio AI uses cookies and similar technologies.",
  alternates: { canonical: "/cookie-policy" },
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <div className="screen active" id="screen-cookie-policy">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Cookie Policy</div>
      </div>
      <div className="content-screen">
        <span className="legal-date">Last Updated: January 2026</span>
        <h2>What We Use Cookies For</h2>
        <p>
          CreatorOS Studio AI uses only the minimum cookies necessary to keep you signed in and to remember
          your session securely. We do not use advertising or third-party tracking cookies.
        </p>
        <h2>Essential Cookies</h2>
        <ul>
          <li>Authentication session cookies (Supabase) — keep you logged in between visits</li>
          <li>Admin session cookies — used only on the admin panel, for authorized administrators</li>
        </ul>
        <h2>Local/Session Storage</h2>
        <p>
          Some non-cookie browser storage is used for functional purposes only — for example,
          remembering that you&apos;ve already seen the loading screen this session, or carrying you
          through to the upgrade page after signing in. None of this is used for advertising or
          cross-site tracking.
        </p>
        <h2>Third-Party Services</h2>
        <p>
          Payment processing (Razorpay) and AI generation may involve their own cookies or similar
          technologies governed by their respective privacy policies, not ours.
        </p>
        <h2>Managing Cookies</h2>
        <p>
          You can clear cookies via your browser settings at any time. Doing so will sign you out of
          CreatorOS Studio AI.
        </p>
        <h2>Contact</h2>
        <p>
          Questions? Email <strong style={{ color: "var(--primary2)" }}>Caeliumtube@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}

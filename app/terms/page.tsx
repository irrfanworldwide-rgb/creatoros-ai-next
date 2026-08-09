import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using CreatorOS Studio AI.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="screen active" id="screen-terms">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Terms of Use</div>
      </div>
      <div className="content-screen">
        <span className="legal-date">Last Updated: January 2026</span>
        <h2>Free to Use</h2>
        <p>Free tier: 3 generations/day. Pro plan: unlimited at ₹299/mo.</p>
        <h2>User Responsibility</h2>
        <p>Review AI-generated content before publishing or distributing.</p>
        <h2>Prohibited Uses</h2>
        <ul>
          <li>Illegal or harmful content</li>
          <li>Automated bulk scraping</li>
          <li>Hacking the platform</li>
        </ul>
        <h2>Contact</h2>
        <p>
          Email <strong style={{ color: "var(--primary2)" }}>Caeliumtube@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}

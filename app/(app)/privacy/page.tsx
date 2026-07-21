import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="screen active" id="screen-privacy">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Privacy Policy</div>
      </div>
      <div className="content-screen">
        <span className="legal-date">Last Updated: January 2026</span>
        <h2>Information We Collect</h2>
        <p>We collect your email when you create an account and store generation history if you save it. No payment data is stored directly by us.</p>
        <h2>Cookies</h2>
        <p>Minimal cookies for authentication sessions only. No tracking or advertising cookies.</p>
        <h2>AI-Generated Content</h2>
        <p>Content is produced by an automated AI system. Review all content before publishing.</p>
        <h2>No Data Selling</h2>
        <p>We do not sell or share your data with third parties for marketing purposes.</p>
        <h2>Contact</h2>
        <p>
          Questions? Email <strong style={{ color: "var(--primary2)" }}>Caeliumtube@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "CreatorOS AI's refund policy for Pro plan subscriptions.",
  alternates: { canonical: "/refund-policy" },
  robots: { index: true, follow: true },
};

export default function RefundPolicyPage() {
  return (
    <div className="screen active" id="screen-refund-policy">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Refund Policy</div>
      </div>
      <div className="content-screen">
        <span className="legal-date">Last Updated: January 2026</span>
        <h2>Subscription Billing</h2>
        <p>
          The Pro plan is a recurring monthly subscription at ₹299/month, billed automatically via
          Razorpay until cancelled. Your subscription renews each billing cycle unless you cancel
          before the renewal date.
        </p>
        <h2>Cancellations</h2>
        <p>
          You can cancel auto-renewal at any time from your Profile page. Cancelling stops future
          billing, but you keep Pro access until the end of your current paid billing cycle — you
          are not charged again after cancelling.
        </p>
        <h2>Refund Eligibility</h2>
        <p>Refunds may be considered in these cases:</p>
        <ul>
          <li>A duplicate or accidental charge caused by a payment processing error</li>
          <li>A technical issue on our end that prevented you from using the service you were charged for</li>
          <li>A request made within 48 hours of the charge, before meaningful use of the Pro plan that billing cycle</li>
        </ul>
        <h2>Non-Refundable Cases</h2>
        <p>
          We generally do not offer refunds for partial billing periods, for simply changing your
          mind after using the service, or for failing to cancel before a renewal date.
        </p>
        <h2>How to Request a Refund</h2>
        <p>
          Email us with your account email and payment date. We review each request individually and
          respond within a reasonable timeframe. Approved refunds are processed back to your original
          Razorpay payment method.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about a charge? Email <strong style={{ color: "var(--primary2)" }}>Caeliumtube@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}

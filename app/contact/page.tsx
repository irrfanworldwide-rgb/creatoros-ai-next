import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the CreatorOS AI team.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="screen active" id="screen-contact">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">Contact Us</div>
      </div>
      <div className="content-screen">
        <p style={{ color: "var(--text2)", fontSize: "13.5px", marginBottom: "1rem" }}>
          Have questions? We&apos;d love to hear from you.
        </p>
        <a href="mailto:Caeliumtube@gmail.com" className="contact-row">
          <span className="cr-icon">📧</span>
          <div className="cr-body">
            <h3>Email</h3>
            <p>Caeliumtube@gmail.com</p>
          </div>
        </a>
        <a href="https://instagram.com/irrfan_worldwide" target="_blank" rel="noreferrer" className="contact-row">
          <span className="cr-icon">📸</span>
          <div className="cr-body">
            <h3>Instagram</h3>
            <p>@irrfan_worldwide</p>
          </div>
        </a>
        <a href="tel:+919107388902" className="contact-row">
          <span className="cr-icon">📱</span>
          <div className="cr-body">
            <h3>WhatsApp</h3>
            <p>+91 9107388902</p>
          </div>
        </a>
      </div>
    </div>
  );
}

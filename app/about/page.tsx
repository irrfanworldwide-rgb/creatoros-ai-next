import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "About CreatorOS AI — an AI content creation platform for creators.",
  alternates: { canonical: "/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="screen active" id="screen-about">
      <div className="td-header">
        <Link className="td-back" href="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="td-title">About Us</div>
      </div>
      <div className="content-screen">
        <h2>What We Do</h2>
        <p>
          CreatorOS AI helps creators generate content faster — scripts, hooks, captions, hashtags,
          CTAs, and more — using AI, with 21 purpose-built tools plus an AI chat assistant for
          quick creative help.
        </p>
        <h2>Why We Built It</h2>
        <p>
          Coming up with fresh, platform-ready content ideas every day is one of the hardest parts of
          being a creator. CreatorOS AI exists to remove that friction — pick a tool, describe what
          you need, and get something you can actually use in seconds.
        </p>
        <h2>Free to Start</h2>
        <p>
          Every account gets free daily generations across all 21 tools with no credit card required.
          A Pro plan is available for unlimited generations.
        </p>
        <h2>Get in Touch</h2>
        <p>
          Have feedback, a feature request, or a question? We&apos;d love to hear from you — visit our{" "}
          <Link href="/contact" style={{ color: "var(--primary2)" }}>
            Contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

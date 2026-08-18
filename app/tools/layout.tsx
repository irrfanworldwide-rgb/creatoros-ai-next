import type { Metadata } from "next";

// FIXED (Google Search Console: "Excluded by 'noindex' tag" on
// /tools) — this used to block the whole /tools route from indexing.
// /tools is now a real public SEO landing page for logged-out visitors
// and crawlers (see page.tsx), while logged-in users still see the
// existing dashboard grid, completely unchanged. The page.tsx file
// itself was not modified for this — only this metadata layer.
export const metadata: Metadata = {
  alternates: { canonical: "/tools" },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

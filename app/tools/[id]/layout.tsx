import type { Metadata } from "next";

// Overrides the parent /tools layout's noindex: individual tool pages
// (e.g. /tools/hook) are publicly viewable — login is only required to
// actually generate — and make reasonable SEO landing pages, so they
// should stay indexable even though the tools *grid* itself is not.
export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

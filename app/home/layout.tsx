import type { Metadata } from "next";

// This screen is only meaningful when logged in — keep it out of search
// results. Purely additive: the page.tsx in this folder is unchanged.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

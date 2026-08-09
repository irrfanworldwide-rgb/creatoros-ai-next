import type { Metadata } from "next";
import { TOOLS } from "@/data/tools";

// Overrides the parent /tools layout's noindex: individual tool pages
// (e.g. /tools/hook) are publicly viewable — login is only required to
// actually generate — and make reasonable SEO landing pages, so they
// should stay indexable even though the tools *grid* itself is not.
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const tool = TOOLS.find((t) => t.id === params.id);
  if (!tool) {
    return { robots: { index: true, follow: true } };
  }
  return {
    title: tool.name,
    description: `${tool.desc} Free AI tool from CreatorOS Studio AI — generate in seconds.`,
    alternates: { canonical: `/tools/${tool.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${tool.name} — CreatorOS Studio AI`,
      description: tool.desc,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

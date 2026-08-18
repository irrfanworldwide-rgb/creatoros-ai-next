import type { Metadata } from "next";
import { TOOLS } from "@/data/tools";

// Per-tool metadata: each tool page (e.g. /tools/hook) is publicly
// viewable — login is only required to actually generate — and makes
// a reasonable SEO landing page, so it gets its own title/description/
// canonical here rather than inheriting the parent /tools layout's.
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const tool = TOOLS.find((t) => t.id === params.id);
  if (!tool) {
    return { robots: { index: true, follow: true } };
  }
  return {
    title: `${tool.name} — Free AI ${tool.cat} Tool`,
    description: `${tool.desc} Free AI tool from CreatorOS Studio AI — generate in seconds.`,
    alternates: { canonical: `/tools/${tool.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${tool.name} — CreatorOS Studio AI`,
      description: tool.desc,
      type: "website",
      siteName: "CreatorOS Studio AI",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} — CreatorOS Studio AI`,
      description: tool.desc,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

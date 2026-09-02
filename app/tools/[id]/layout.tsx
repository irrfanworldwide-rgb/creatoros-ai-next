import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/data/tools";
import { TOOL_SEO_CONTENT } from "@/data/toolSeoContent";

// Unique, keyword-targeted titles/descriptions for the tools with real
// Google Search Console query signal (see brief: "brand name generator",
// "SEO generator", "AI caption writer", "Instagram username generator").
// Every other tool keeps the existing generic per-category template
// below — unchanged from before this pass.
const SEO_META: Record<string, { title: string; description: string }> = {
  brandname: {
    title: "AI Brand Name Generator — Free Business & Startup Name Ideas",
    description:
      "Generate brand name ideas for your business, startup, or product with AI. Enter your niche and vibe to get 20 unique brand name ideas, free.",
  },
  seo: {
    title: "AI SEO Keyword Generator — Free Keyword Ideas Tool",
    description:
      "Generate SEO keywords for any topic with AI. Get primary, long-tail, related, and question-based keywords for YouTube, blogs, or Instagram, free.",
  },
  caption: {
    title: "AI Instagram Caption Generator — Free Caption Writer",
    description:
      "Write Instagram captions with AI in seconds. Get 3 ready-to-post captions with different angles for any topic and tone, free.",
  },
  username: {
    title: "AI Instagram Username Generator — Free Handle Ideas",
    description:
      "Generate Instagram username ideas with AI. Get 25 available-feeling handle ideas grouped by style, based on your name or niche, free.",
  },
};

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const tool = TOOLS.find((t) => t.id === params.id);
  if (!tool) {
    return { robots: { index: true, follow: true } };
  }
  const override = SEO_META[tool.id];
  const title = override?.title || `${tool.name} — Free AI ${tool.cat} Tool`;
  const description = override?.description || `${tool.desc} Free AI tool from CreatorOS Studio AI — generate in seconds.`;
  return {
    title,
    description,
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

export default function Layout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const content = TOOL_SEO_CONTENT[params.id];

  // No FAQPage schema unless this tool actually has visible FAQ content
  // below — schema must always match what's really on the page.
  const faqSchema =
    content && content.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {content && (
        <div className="td-body" style={{ paddingBottom: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: ".5rem", lineHeight: 1.3 }}>{content.h1}</h1>
          <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7 }}>{content.intro}</p>
        </div>
      )}
      {children}
      {content && (
        <div className="td-seo-wrap">
          {content.sections.map((s) => (
            <details className="td-seo-accordion" key={s.heading}>
              <summary>
                <h2>{s.heading}</h2>
              </summary>
              <p>{s.body}</p>
            </details>
          ))}
          {content.faq.length > 0 && (
            <details className="td-seo-accordion">
              <summary>
                <h2>{TOOLS.find((t) => t.id === params.id)?.name} FAQ</h2>
              </summary>
              <div>
                {content.faq.map((f) => (
                  <div className="td-seo-faq-item" key={f.q}>
                    <h3>{f.q}</h3>
                    <p>{f.a}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
          {(() => {
            const current = TOOLS.find((t) => t.id === params.id);
            const related = current ? TOOLS.filter((t) => t.cat === current.cat && t.id !== current.id).slice(0, 3) : [];
            if (related.length === 0) return null;
            return (
              <div className="td-seo-related">
                <h2>Related AI Tools</h2>
                <div className="td-seo-chips">
                  {related.map((t) => (
                    <Link key={t.id} href={`/tools/${t.id}`} className="td-seo-chip">
                      {t.icon} {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}

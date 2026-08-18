"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/contexts/SessionContext";
import BottomNav from "@/components/BottomNav";
import ScreenLoader from "@/components/ScreenLoader";
import { TOOLS, CATS } from "@/data/tools";

export default function ToolsPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    return TOOLS.filter((t) => {
      const matchesCat = cat === "All" || t.cat === cat;
      const matchesQuery =
        !query.trim() ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.desc.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [query, cat]);

  if (loading) return <ScreenLoader />;

  // Logged-in: the existing authenticated dashboard grid — unchanged
  // from before this SEO pass, same state, same filtering, same click
  // behavior (navigates straight into the tool).
  if (user) {
    return (
      <div className="screen active">
        <div className="tools-header">
          <h1>All Tools</h1>
          <div className="search-box">
            <span>🔍</span>
            <input
              id="toolSearch"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="cat-scroll">
          <div className="cat-inner">
            {CATS.map((c) => (
              <button key={c} className={`cat-btn ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="tools-grid">
          {filtered.map((t) => (
            <div key={t.id} className="tool-card" onClick={() => router.push(`/tools/${t.id}`)}>
              {t.badge && <div className="tc-badge">{t.badge}</div>}
              <div className="tc-icon">{t.icon}</div>
              <div className="tc-name">{t.name}</div>
              <div className="tc-desc">{t.desc}</div>
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    );
  }

  // Logged-out / crawler: real public SEO landing page. Real content,
  // real crawlable links to each tool's existing indexable detail page
  // (app/tools/[id]/) — no duplicate routes created.
  return (
    <div className="screen active">
      <div className="tools-header">
        <h1>AI Tools for Creators</h1>
      </div>

      <div className="td-body" style={{ paddingTop: 0 }}>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          CreatorOS Studio AI is an AI-powered creative workspace for creators. Browse every AI tool below —
          script generators, hook generators, caption generators, hashtag generators, and more — built for
          YouTube, Instagram, and TikTok creators. Sign up free to start generating.
        </p>
      </div>

      <div className="tools-grid">
        {TOOLS.map((t) => (
          <Link key={t.id} href={`/tools/${t.id}`} className="tool-card" style={{ textDecoration: "none", display: "block" }}>
            {t.badge && <div className="tc-badge">{t.badge}</div>}
            <div className="tc-icon">{t.icon}</div>
            <div className="tc-name">{t.name}</div>
            <div className="tc-desc">{t.desc}</div>
          </Link>
        ))}
      </div>

      <div style={{ padding: "0 1.25rem 2rem", textAlign: "center" }}>
        <Link href="/" className="btn-grad" style={{ display: "inline-block", textDecoration: "none" }}>
          Get Started Free →
        </Link>
      </div>
    </div>
  );
}

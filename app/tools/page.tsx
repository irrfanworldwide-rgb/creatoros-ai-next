"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import BottomNav from "@/components/BottomNav";
import ScreenLoader from "@/components/ScreenLoader";
import { TOOLS, CATS } from "@/data/tools";

export default function ToolsPage() {
  const { user, loading } = useRequireAuth();
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

  if (loading || !user) return <ScreenLoader />;

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

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getGenerations, deleteGeneration, type GenerationRecord } from "@/lib/supabase/data";
import BottomNav from "@/components/BottomNav";
import ScreenLoader from "@/components/ScreenLoader";
import { useToast } from "@/contexts/ToastContext";

export default function LibraryPage() {
  const { user, loading } = useRequireAuth();
  const [items, setItems] = useState<GenerationRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTool, setActiveTool] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;
    const sb = getSupabaseBrowserClient();
    getGenerations(sb, user.id)
      .then(setItems)
      .catch(() => showToast("Could not load your Library. Please try again."))
      .finally(() => setFetching(false));
  }, [user, showToast]);

  const toolTabs = useMemo(() => {
    const names = Array.from(new Set(items.map((i) => i.tool_name)));
    return ["All", ...names];
  }, [items]);

  const filtered = activeTool === "All" ? items : items.filter((i) => i.tool_name === activeTool);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const sb = getSupabaseBrowserClient();
      await deleteGeneration(sb, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Deleted");
    } catch {
      showToast("Could not delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopy(item: GenerationRecord) {
    navigator.clipboard
      .writeText(item.content)
      .then(() => {
        setCopiedId(item.id);
        showToast("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 1500);
      })
      .catch(() => showToast("Could not copy. Please select and copy the text manually."));
  }

  if (loading || !user) return <ScreenLoader />;

  return (
    <div className="screen active">
      <div className="lib-header">
        <h1>Library</h1>
        {toolTabs.length > 1 && (
          <div className="lib-tabs">
            {toolTabs.map((t) => (
              <button key={t} className={`lib-tab ${activeTool === t ? "active" : ""}`} onClick={() => setActiveTool(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {!fetching && filtered.length === 0 ? (
        <div className="lib-empty">
          <div className="lib-empty-icon">📚</div>
          <h3>Nothing saved yet</h3>
          <p>Generations you save from any tool will show up here.</p>
        </div>
      ) : (
        <div className="lib-grid">
          {filtered.map((item) => (
            <div key={item.id} className="lib-card">
              <div className="lib-card-top">
                <span className="lib-tool-badge">{item.tool_name}</span>
                <span className="lib-date">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <div className="lib-preview">{item.content}</div>
              <div className="lib-actions">
                <button className="lib-btn" onClick={() => handleCopy(item)}>
                  {copiedId === item.id ? "Copied" : "Copy"}
                </button>
                <button className="lib-btn" disabled={deletingId === item.id} onClick={() => handleDelete(item.id)}>
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

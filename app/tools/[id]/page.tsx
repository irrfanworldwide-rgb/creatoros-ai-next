"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TOOLS } from "@/data/tools";
import { useSession } from "@/contexts/SessionContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { canGenerate, saveGeneration } from "@/lib/supabase/data";
import { useToast } from "@/contexts/ToastContext";
import ScreenLoader from "@/components/ScreenLoader";
import { useUpgradeFlow } from "@/hooks/useUpgradeFlow";
import { useFreeDailyLimit } from "@/hooks/useFreeDailyLimit";
import { createRipple } from "@/lib/ui/ripple";
import dynamic from "next/dynamic";
import type { ToolValues } from "@/types/tool";

const ResponseReveal = dynamic(() => import("@/components/ResponseReveal"), { ssr: false });

export default function ToolDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tool = TOOLS.find((t) => t.id === params.id);
  const { user, profile, usageToday, refreshUsage, loading: sessionLoading } = useSession();

  const [values, setValues] = useState<ToolValues>({});
  const [loadingGen, setLoadingGen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const { goToUpgrade, redirecting } = useUpgradeFlow();
  const freeDailyLimit = useFreeDailyLimit();

  if (!tool) {
    return (
      <div className="screen active">
        <div className="td-header">
          <Link className="td-back" href="/tools">
            ←
          </Link>
          <div className="td-title">Tool not found</div>
        </div>
      </div>
    );
  }

  if (sessionLoading) return <ScreenLoader />;

  const plan = profile?.plan ?? "free";
  const allowed = user ? canGenerate(plan, usageToday, freeDailyLimit) : false;

  function setValue(id: string, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  async function handleGenerate() {
    if (!tool || !user) return;
    if (!canGenerate(plan, usageToday, freeDailyLimit)) return;

    setLoadingGen(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const sb = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await sb.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError("Your session expired. Please sign in again.");
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ prompt: tool.prompt(values), toolId: tool.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errText = data.error || "Something went wrong. Please try again.";
        setError(errText);
        showToast(errText);
        return;
      }

      setResult(data.content);
      await refreshUsage();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Generation request failed:", err);
      const errText = "Something went wrong. Please try again.";
      setError(errText);
      showToast(errText);
    } finally {
      setLoadingGen(false);
    }
  }

  async function handleSave() {
    if (!user || !result || !tool || saving || saved) return;
    setSaving(true);
    try {
      const sb = getSupabaseBrowserClient();
      await saveGeneration(sb, user.id, tool.id, tool.name, result);
      setSaved(true);
      showToast("Saved to Library");
    } catch (err) {
      // Log the full Supabase error (code/message/details/hint) — this
      // was previously discarded entirely by an empty catch, which is
      // why this failure had zero visibility. Check the browser console
      // for the real cause (commonly an RLS policy or schema mismatch).
      // eslint-disable-next-line no-console
      console.error("Save to Library failed — full error object:", err);
      // Supabase's PostgrestError is often a plain object with a
      // .message string, not a true `Error` instance, so check for the
      // property directly rather than only `err instanceof Error`.
      const rawMessage =
        typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : typeof err === "string"
            ? err
            : null;
      const message = rawMessage ? `Could not save: ${rawMessage}` : "Could not save. Please try again.";
      showToast(message);
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard
      .writeText(result)
      .then(() => {
        setCopied(true);
        showToast("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => showToast("Could not copy. Please select and copy the text manually."));
  }

  const usageDots = Array.from({ length: freeDailyLimit }, (_, i) => i < usageToday);

  return (
    <div className="tool-detail-screen screen active">
      <div className="td-header">
        <div className="td-back" onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <div className="td-title">{tool.name}</div>
      </div>

      <div className="td-body">
        <div className="td-tool-header">
          <div className="td-tool-icon">{tool.icon}</div>
          <div>
            <div className="td-tool-name">{tool.name}</div>
            <div className="td-tool-desc">{tool.desc}</div>
          </div>
        </div>

        {!user ? (
          <div className="login-gate">
            <p>
              <strong>Sign in</strong> to use this tool and get 3 free generations every day.
            </p>
            <div className="lg-btns">
              <button className="lg-btn-pri" onClick={() => router.push("/")}>
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {plan === "free" && (
              <div className="usage-pill">
                <div className="up-left">
                  <strong>{usageToday}</strong>/{freeDailyLimit} used today
                </div>
                <div className="up-right">
                  <div className="usage-dots">
                    {usageDots.map((used, i) => (
                      <div key={i} className={`udot ${used ? "used" : ""}`} />
                    ))}
                  </div>
                  <button className="upg-btn" onClick={goToUpgrade}>
                    Upgrade
                  </button>
                </div>
              </div>
            )}

            {tool.inputs.map((input) => (
              <div className="inp-group" key={input.id}>
                <label className="inp-label">{input.label}</label>
                {input.type === "textarea" ? (
                  <textarea
                    className="inp-field"
                    rows={input.rows || 3}
                    placeholder={input.placeholder}
                    value={values[input.id] || ""}
                    onChange={(e) => setValue(input.id, e.target.value)}
                  />
                ) : input.type === "select" ? (
                  <select
                    className="inp-field"
                    value={values[input.id] || input.options?.[0] || ""}
                    onChange={(e) => setValue(input.id, e.target.value)}
                  >
                    {input.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="inp-field"
                    placeholder={input.placeholder}
                    value={values[input.id] || ""}
                    onChange={(e) => setValue(input.id, e.target.value)}
                  />
                )}
              </div>
            ))}

            <button
              className="gen-btn ripple-container"
              disabled={loadingGen || redirecting}
              onClick={(e) => {
                if (!allowed) {
                  createRipple(e);
                  goToUpgrade();
                  return;
                }
                handleGenerate();
              }}
            >
              {loadingGen ? (
                <span className="spinner" style={{ display: "inline-block" }} />
              ) : !allowed ? (
                <span className="upgrade-inline-cta">
                  {redirecting && <span className="spinner" style={{ display: "inline-block" }} />}
                  {redirecting ? "Redirecting..." : "Daily limit reached — Upgrade to Pro"}
                </span>
              ) : (
                <>✨ Generate</>
              )}
            </button>

            {error && <div className="err-msg" style={{ display: "block" }}>{error}</div>}

            {loadingGen && (
              <div className="skeleton-wrap visible">
                <div className="skel-line" />
                <div className="skel-line" />
                <div className="skel-line" />
                <div className="skel-line" />
                <div className="skel-line" />
              </div>
            )}

            {result && !loadingGen && (
              <div className="result-card visible premium-card">
                <div className="result-hdr">
                  <div className="result-title">✨ Result</div>
                  <div className="result-actions">
                    <button
                      className={`act-btn ripple-container ${copied ? "copied" : ""}`}
                      onClick={(e) => {
                        createRipple(e);
                        handleCopy();
                      }}
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      className={`act-btn ripple-container ${saved ? "copied" : ""}`}
                      onClick={(e) => {
                        createRipple(e);
                        handleSave();
                      }}
                      disabled={saved || saving}
                    >
                      {saving ? "Saving..." : saved ? "Saved" : "Save"}
                    </button>
                    <button
                      className="act-btn ripple-container"
                      disabled={loadingGen}
                      onClick={(e) => {
                        createRipple(e);
                        handleGenerate();
                      }}
                    >
                      ↻ Regenerate
                    </button>
                  </div>
                </div>
                <div className="result-content">
                  <ResponseReveal content={result} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

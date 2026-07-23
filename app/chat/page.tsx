"use client";

import { useState, useRef } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSession } from "@/contexts/SessionContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { canGenerate } from "@/lib/supabase/data";
import BottomNav from "@/components/BottomNav";
import ScreenLoader from "@/components/ScreenLoader";
import { useToast } from "@/contexts/ToastContext";
import { useUpgradeFlow } from "@/hooks/useUpgradeFlow";
import { createRipple } from "@/lib/ui/ripple";
import ResponseReveal from "@/components/ResponseReveal";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const { user, loading } = useRequireAuth();
  const { profile, usageToday, refreshUsage } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();
  const { goToUpgrade, redirecting } = useUpgradeFlow();

  if (loading || !user) return <ScreenLoader />;

  const plan = profile?.plan ?? "free";
  const allowed = canGenerate(plan, usageToday);

  async function callGenerate(prompt: string): Promise<{ ok: boolean; text: string }> {
    try {
      const sb = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await sb.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        return { ok: false, text: "Your session expired. Please sign in again." };
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUsage();
        return { ok: true, text: data.content };
      }
      return { ok: false, text: data.error || "Something went wrong." };
    } catch {
      return { ok: false, text: "Something went wrong. Please try again." };
    }
  }

  async function handleSend() {
    if (!input.trim() || sending || !allowed || !user) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const { ok, text } = await callGenerate(userMsg.content);
    setMessages((prev) => [...prev, { role: "ai", content: text }]);
    if (!ok) showToast("Message failed to send");
    setSending(false);
  }

  async function handleRegenerateLast() {
    if (sending || !allowed) return;
    // Find the last user message — that's what we're regenerating a
    // response to. Drop the old AI reply that followed it.
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;
    const realIndex = messages.length - 1 - lastUserIndex;
    const lastUserMsg = messages[realIndex];

    setMessages((prev) => prev.slice(0, realIndex + 1)); // keep up to and including the user message
    setSending(true);

    const { ok, text } = await callGenerate(lastUserMsg.content);
    setMessages((prev) => [...prev, { role: "ai", content: text }]);
    if (!ok) showToast("Regeneration failed");
    setSending(false);
  }

  function handleCopyMessage(text: string) {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
  }

  const lastAiIndex = messages.map((m) => m.role).lastIndexOf("ai");

  return (
    <div className="screen active chat-screen">
      <div className="chat-header">
        <h1>AI Chat</h1>
        <button className="chat-new-btn" onClick={handleNewChat}>
          New Chat
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="chat-empty">
          <div className="chat-empty-icon">💬</div>
          <h2>Ask me anything</h2>
          <p>Brainstorm ideas, refine a caption, or get quick creative help.</p>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role === "user" ? "user" : ""}`}>
              <div className={`msg-avatar ${m.role === "ai" ? "ai" : ""}`}>
                {m.role === "ai" ? "✨" : (user.email?.charAt(0) || "U").toUpperCase()}
              </div>
              <div className={`msg-bubble ${m.role === "user" ? "user" : "ai-bubble"}`}>
                {m.role === "ai" ? (
                  <>
                    <ResponseReveal content={m.content} />
                    <div className="msg-actions">
                      <button
                        className="msg-action-btn ripple-container"
                        onClick={(e) => {
                          createRipple(e);
                          handleCopyMessage(m.content);
                        }}
                      >
                        Copy
                      </button>
                      {i === lastAiIndex && !sending && (
                        <button
                          className="msg-action-btn ripple-container"
                          onClick={(e) => {
                            createRipple(e);
                            handleRegenerateLast();
                          }}
                        >
                          ↻ Regenerate
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="chat-msg">
              <div className="msg-avatar ai">✨</div>
              <div className="msg-bubble typing-cur"></div>
            </div>
          )}
        </div>
      )}

      <div className="chat-input-wrap">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder={allowed ? "Type a message..." : "Daily limit reached — upgrade to Pro"}
          rows={1}
          value={input}
          disabled={!allowed}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="chat-send-btn ripple-container"
          disabled={sending || redirecting || (allowed && !input.trim())}
          onClick={(e) => {
            if (!allowed) {
              createRipple(e);
              goToUpgrade();
              return;
            }
            handleSend();
          }}
          title={allowed ? "Send" : "Upgrade to Pro"}
        >
          {redirecting ? <span className="spinner" style={{ display: "inline-block" }} /> : allowed ? "➤" : "⭐"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

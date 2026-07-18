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

  async function handleSend() {
    if (!input.trim() || sending || !allowed || !user) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const sb = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await sb.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setMessages((prev) => [...prev, { role: "ai", content: "Your session expired. Please sign in again." }]);
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ prompt: userMsg.content }),
      });
      const data = await res.json();
      const aiText: string = res.ok ? data.content : data.error || "Something went wrong.";
      setMessages((prev) => [...prev, { role: "ai", content: aiText }]);

      if (res.ok) {
        await refreshUsage();
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "Something went wrong. Please try again." }]);
      showToast("Message failed to send");
    } finally {
      setSending(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
  }

  return (
    <div className="screen active">
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
              <div className={`msg-bubble ${m.role === "user" ? "user" : ""}`}>{m.content}</div>
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

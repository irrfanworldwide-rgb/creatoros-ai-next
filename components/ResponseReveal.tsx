"use client";

import { useEffect, useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ResponseRevealProps {
  content: string;
}

export default function ResponseReveal({ content }: ResponseRevealProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 240);
    return () => clearTimeout(t);
  }, [content]);

  if (!revealed) {
    return (
      <div className="ai-output" aria-hidden="true">
        <span className="typing-cur">&nbsp;</span>
      </div>
    );
  }

  return (
    <div className="ai-reveal">
      <MarkdownRenderer content={content} />
    </div>
  );
}

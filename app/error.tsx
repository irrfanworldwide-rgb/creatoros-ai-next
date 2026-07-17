"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div
      className="screen active"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "2rem", textAlign: "center" }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
      <h2 style={{ fontFamily: "var(--font-space-grotesk),sans-serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: ".5rem" }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "1.25rem", maxWidth: 320 }}>
        An unexpected error occurred. Your data is safe — try again, or head back home.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-grad" onClick={() => reset()}>
          Try again
        </button>
        <button className="btn-outline" onClick={() => (window.location.href = "/")}>
          Go home
        </button>
      </div>
    </div>
  );
}

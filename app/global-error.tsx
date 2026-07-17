"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "sans-serif",
            background: "#0D1117",
            color: "#e6edf3",
          }}
        >
          <h2 style={{ marginBottom: ".5rem" }}>Something went wrong</h2>
          <p style={{ color: "#8b949e", marginBottom: "1.25rem" }}>Please try reloading the page.</p>
          <button
            onClick={() => reset()}
            style={{
              background: "linear-gradient(135deg,#7C3AED,#A855F7)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 26px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

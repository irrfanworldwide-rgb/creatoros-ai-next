export default function ConfigError({ missing }: { missing: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚙️</div>
      <h2 style={{ fontFamily: "var(--font-space-grotesk),sans-serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: ".5rem" }}>
        Configuration needed
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "1rem", maxWidth: 380 }}>
        This deployment is missing required environment variables, so the app can&apos;t start:
      </p>
      <ul style={{ fontSize: "12.5px", color: "var(--red)", marginBottom: "1.25rem", listStyle: "none", padding: 0 }}>
        {missing.map((m) => (
          <li key={m} style={{ marginBottom: 4, fontFamily: "monospace" }}>
            {m}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "12px", color: "var(--text3)", maxWidth: 380 }}>
        If you&apos;re the developer: add these in your hosting provider&apos;s Environment Variables
        settings (e.g. Vercel → Project → Settings → Environment Variables), then{" "}
        <strong>redeploy</strong> — variables prefixed <code>NEXT_PUBLIC_</code> are baked into the
        build, so adding them without redeploying won&apos;t take effect. See SETUP.md /
        DEPLOYMENT_CHECKLIST.md.
      </p>
    </div>
  );
}

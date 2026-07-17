import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="screen active"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "2rem", textAlign: "center" }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
      <h2 style={{ fontFamily: "var(--font-space-grotesk),sans-serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: ".5rem" }}>
        Page not found
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "1.25rem", maxWidth: 320 }}>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link className="btn-grad" href="/">
        Go home
      </Link>
    </div>
  );
}

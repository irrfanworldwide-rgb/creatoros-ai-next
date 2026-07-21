"use client";

import { useEffect, useState } from "react";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setMaintenanceMode(!!data.maintenanceMode))
      .catch(() => setMaintenanceMode(false))
      .finally(() => setChecked(true));
  }, []);

  // Avoid a flash of the real app before the check resolves — render
  // nothing (the splash screen is already covering the viewport at this
  // point in the tree anyway) until we know.
  if (!checked) return null;

  if (maintenanceMode) {
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
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🛠️</div>
        <div className="splash-logo" style={{ marginBottom: ".5rem" }}>
          CreatorOS AI
        </div>
        <h2 style={{ fontFamily: "var(--font-space-grotesk),sans-serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: ".5rem" }}>
          We&apos;ll be right back
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text2)", maxWidth: 320 }}>
          CreatorOS AI is undergoing scheduled maintenance. Please check back shortly.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

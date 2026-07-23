"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsClient() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setMaintenanceMode(data.settings?.maintenance_mode === true))
      .finally(() => setLoading(false));
  }, []);

  async function toggleMaintenance() {
    setSaving(true);
    const next = !maintenanceMode;
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "maintenance_mode", value: next }),
    });
    if (res.ok) setMaintenanceMode(next);
    setSaving(false);
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Settings</h1>
          <p>Site-wide configuration</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Maintenance Mode</div>
        <p style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: "1rem", lineHeight: 1.6 }}>
          When enabled, every visitor sees a maintenance page instead of the app. The Admin Panel
          stays accessible so you can turn it back off. Takes effect within a few seconds — no
          redeploy needed.
        </p>
        <button
          className={`admin-btn ${maintenanceMode ? "admin-btn-danger" : "admin-btn-primary"}`}
          disabled={loading || saving}
          onClick={toggleMaintenance}
        >
          {saving ? "Saving..." : maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        </button>
        <div style={{ marginTop: 10 }}>
          <span className={`admin-badge ${maintenanceMode ? "halted" : "active"}`}>
            Currently {maintenanceMode ? "ON — site is down for users" : "OFF — site is live"}
          </span>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">More settings — coming in Phase 11</div>
        <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.7 }}>
          Monthly subscription price, free generation limit, AI provider selection, branding
          (logo/name/favicon), support email, and social links are planned for Phase 11 — each will
          land as a new row in the same <code>settings</code> table, so no further schema changes
          will be needed.
        </p>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";

const DEFAULT_LIMIT = 3;

export default function AdminSettingsClient() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_LIMIT);
  const [dailyLimitInput, setDailyLimitInput] = useState(String(DEFAULT_LIMIT));
  const [loading, setLoading] = useState(true);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setMaintenanceMode(data.settings?.maintenance_mode === true);
        const limit = data.settings?.free_daily_limit;
        const resolved = typeof limit === "number" && limit > 0 ? limit : DEFAULT_LIMIT;
        setDailyLimit(resolved);
        setDailyLimitInput(String(resolved));
      })
      .catch(() => showToast("Could not load settings."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleMaintenance() {
    setSavingMaintenance(true);
    const next = !maintenanceMode;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "maintenance_mode", value: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Could not update maintenance mode.");
        return;
      }
      setMaintenanceMode(next);
      showToast(next ? "Maintenance mode enabled" : "Maintenance mode disabled");
    } catch {
      showToast("Could not update maintenance mode. Check your connection.");
    } finally {
      setSavingMaintenance(false);
    }
  }

  async function handleSaveLimit() {
    const parsed = parseInt(dailyLimitInput, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1000) {
      showToast("Enter a whole number between 1 and 1000.");
      return;
    }
    setSavingLimit(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "free_daily_limit", value: parsed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Could not save the limit.");
        return;
      }
      setDailyLimit(parsed);
      setDailyLimitInput(String(parsed));
      showToast(`Free plan daily limit set to ${parsed}`);
    } catch {
      showToast("Could not save the limit. Check your connection.");
    } finally {
      setSavingLimit(false);
    }
  }

  const limitDirty = dailyLimitInput !== String(dailyLimit);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Settings</h1>
          <p>Site-wide configuration</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Rate Limits</div>
        <p style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: "1rem", lineHeight: 1.6 }}>
          Number of AI generations a Free plan user gets per day. Pro users are always unlimited.
          Takes effect immediately for every new generation request — no redeploy needed.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <input
            className="admin-input"
            type="number"
            min={1}
            max={1000}
            value={dailyLimitInput}
            disabled={loading}
            onChange={(e) => setDailyLimitInput(e.target.value)}
            style={{ width: 100 }}
          />
          <span style={{ fontSize: 12.5, color: "var(--text2)" }}>generations / day (Free plan)</span>
          <button
            className="admin-btn admin-btn-primary"
            disabled={loading || savingLimit || !limitDirty}
            onClick={handleSaveLimit}
          >
            {savingLimit ? "Saving..." : "Save"}
          </button>
        </div>
        <div style={{ marginTop: 10 }}>
          <span className="admin-badge active">Current limit: {dailyLimit}/day</span>
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
          disabled={loading || savingMaintenance}
          onClick={toggleMaintenance}
        >
          {savingMaintenance ? "Saving..." : maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        </button>
        <div style={{ marginTop: 10 }}>
          <span className={`admin-badge ${maintenanceMode ? "halted" : "active"}`}>
            Currently {maintenanceMode ? "ON — site is down for users" : "OFF — site is live"}
          </span>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">More settings — coming in a future phase</div>
        <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.7 }}>
          Monthly subscription price, AI provider selection, branding (logo/name/favicon), support
          email, and social links will land as new rows in this same <code>settings</code> table —
          no further schema changes needed.
        </p>
      </div>
    </>
  );
}

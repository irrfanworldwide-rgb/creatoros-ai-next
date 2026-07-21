"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminSubRow {
  id: string;
  email: string | null;
  plan: string;
  razorpay_subscription_id: string;
  subscription_status: string | null;
  subscription_current_end: string | null;
  last_payment_at: string | null;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<AdminSubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
    const data = await res.json();
    setSubs(res.ok ? data.subscriptions : []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  async function handleAction(userId: string, action: string, days?: number) {
    setBusyId(userId);
    await fetch(`/api/admin/subscriptions/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, days }),
    });
    await fetchSubs();
    setBusyId(null);
  }

  async function handleCancel(userId: string) {
    setBusyId(userId);
    await fetch(`/api/admin/subscriptions/${userId}/cancel`, { method: "POST" });
    await fetchSubs();
    setBusyId(null);
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Subscriptions</h1>
          <p>{subs.length} shown{loading ? " — loading..." : ""}</p>
        </div>
      </div>

      <div className="admin-filters">
        <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending (payment issue)</option>
          <option value="cancelled">Cancelled</option>
          <option value="halted">Halted</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subscription ID</th>
                <th>Next Billing</th>
                <th>Last Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td>{s.email || "—"}</td>
                  <td>
                    <span className={`admin-badge ${s.subscription_status || "none"}`}>{s.subscription_status || "None"}</span>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{s.razorpay_subscription_id}</td>
                  <td>{s.subscription_current_end ? new Date(s.subscription_current_end).toLocaleDateString() : "—"}</td>
                  <td>{s.last_payment_at ? new Date(s.last_payment_at).toLocaleDateString() : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="admin-btn" disabled={busyId === s.id} onClick={() => handleAction(s.id, "manual_activate")}>
                        Manual Activate
                      </button>
                      <button className="admin-btn" disabled={busyId === s.id} onClick={() => handleAction(s.id, "extend", 30)}>
                        Extend 30d
                      </button>
                      <button className="admin-btn" disabled={busyId === s.id} onClick={() => handleAction(s.id, "downgrade")}>
                        Downgrade
                      </button>
                      <button className="admin-btn admin-btn-danger" disabled={busyId === s.id} onClick={() => handleCancel(s.id)}>
                        Cancel (Razorpay)
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && subs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: "2rem" }}>
                    No subscriptions match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

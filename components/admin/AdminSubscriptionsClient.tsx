"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";

interface AdminSubRow {
  id: string;
  email: string | null;
  plan: string;
  razorpay_subscription_id: string;
  subscription_status: string | null;
  subscription_current_end: string | null;
  last_payment_at: string | null;
}

export default function AdminSubscriptionsClient() {
  const [subs, setSubs] = useState<AdminSubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setSubs(data.subscriptions);
      } else {
        showToast(data.error || "Could not load subscriptions.");
        setSubs([]);
      }
    } catch {
      showToast("Could not load subscriptions. Check your connection.");
      setSubs([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  async function handleAction(userId: string, action: "manual_activate" | "extend" | "downgrade", days?: number) {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/subscriptions/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, days }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Action failed. Please try again.");
        return;
      }
      // Refetch here (rather than a purely optimistic patch) since these
      // actions can change multiple fields at once (plan, status, and for
      // "extend" a recomputed subscription_current_end) — safer to pull
      // the real values back than guess them client-side.
      await fetchSubs();
      const labels: Record<string, string> = {
        manual_activate: "Subscription manually activated",
        extend: "Subscription extended 30 days",
        downgrade: "Subscription downgraded to Free",
      };
      showToast(labels[action] || "Updated");
    } catch {
      showToast("Action failed. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(userId: string) {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/subscriptions/${userId}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Cancellation failed. Please try again.");
        return;
      }
      await fetchSubs();
      showToast("Subscription cancelled via Razorpay");
    } catch {
      showToast("Cancellation failed. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Subscriptions</h1>
          <p>
            {subs.length} shown{loading ? " — loading..." : ""}
          </p>
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
                  <td colSpan={6} style={{ padding: 0 }}>
                    <div className="admin-empty-state">
                      <div className="admin-empty-state-icon">💳</div>
                      <div className="admin-empty-state-text">No subscriptions match this filter.</div>
                    </div>
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

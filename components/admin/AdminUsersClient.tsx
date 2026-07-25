"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";

interface AdminUserRow {
  id: string;
  email: string | null;
  plan: "free" | "pro";
  suspended: boolean;
  subscription_status: string | null;
  subscription_current_end: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  suspend: "User suspended",
  reactivate: "User reactivated",
  upgrade: "Upgraded to Pro",
  downgrade: "Downgraded to Free",
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        showToast(data.error || "Could not load users.");
        setUsers([]);
      }
    } catch {
      showToast("Could not load users. Check your connection.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, planFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300); // debounce search typing
    return () => clearTimeout(t);
  }, [fetchUsers]);

  async function handleAction(id: string, action: "suspend" | "reactivate" | "upgrade" | "downgrade") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Action failed. Please try again.");
        return;
      }
      // Optimistic local update — instant, no wait on a refetch, and
      // correct even if the current filter would otherwise hide the row
      // (e.g. reactivating while "Suspended" filter is active).
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          if (action === "suspend") return { ...u, suspended: true };
          if (action === "reactivate") return { ...u, suspended: false };
          if (action === "upgrade") return { ...u, plan: "pro" };
          if (action === "downgrade") return { ...u, plan: "free" };
          return u;
        })
      );
      showToast(ACTION_LABELS[action] || "Updated");
    } catch {
      showToast("Action failed. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetLimit(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-limit`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Could not reset limit.");
        return;
      }
      showToast("Daily limit reset for this user");
    } catch {
      showToast("Could not reset limit. Check your connection.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Delete failed. Please try again.");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("User deleted");
    } catch {
      showToast("Delete failed. Check your connection and try again.");
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Users</h1>
          <p>
            {users.length} shown{loading ? " — loading..." : ""}
          </p>
        </div>
      </div>

      <div className="admin-filters">
        <input
          className="admin-input"
          placeholder="Search by email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select className="admin-select" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Subscription</th>
                <th>Signed Up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email || "—"}</td>
                  <td>
                    <span className={`admin-badge ${u.plan}`}>{u.plan}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.suspended ? "suspended" : "active"}`}>
                      {u.suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.subscription_status || "none"}`}>
                      {u.subscription_status || "None"}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {u.plan === "free" ? (
                        <button className="admin-btn" disabled={busyId === u.id} onClick={() => handleAction(u.id, "upgrade")}>
                          Upgrade
                        </button>
                      ) : (
                        <button className="admin-btn" disabled={busyId === u.id} onClick={() => handleAction(u.id, "downgrade")}>
                          Downgrade
                        </button>
                      )}
                      {u.suspended ? (
                        <button className="admin-btn" disabled={busyId === u.id} onClick={() => handleAction(u.id, "reactivate")}>
                          Reactivate
                        </button>
                      ) : (
                        <button className="admin-btn" disabled={busyId === u.id} onClick={() => handleAction(u.id, "suspend")}>
                          Suspend
                        </button>
                      )}
                      <button className="admin-btn" disabled={busyId === u.id} onClick={() => handleResetLimit(u.id)}>
                        Reset Limit
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        disabled={busyId === u.id}
                        onClick={() => handleDelete(u.id)}
                      >
                        {confirmDeleteId === u.id ? "Confirm Delete" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 0 }}>
                    <div className="admin-empty-state">
                      <div className="admin-empty-state-icon">👥</div>
                      <div className="admin-empty-state-text">No users match these filters.</div>
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

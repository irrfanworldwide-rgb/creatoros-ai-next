"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminUserRow {
  id: string;
  email: string | null;
  plan: "free" | "pro";
  suspended: boolean;
  subscription_status: string | null;
  subscription_current_end: string | null;
  created_at: string;
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(res.ok ? data.users : []);
    setLoading(false);
  }, [q, planFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300); // debounce search typing
    return () => clearTimeout(t);
  }, [fetchUsers]);

  async function handleAction(id: string, action: string) {
    setBusyId(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await fetchUsers();
    setBusyId(null);
  }

  async function handleResetLimit(id: string) {
    setBusyId(id);
    await fetch(`/api/admin/users/${id}/reset-limit`, { method: "POST" });
    setBusyId(null);
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setBusyId(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    await fetchUsers();
    setBusyId(null);
    setConfirmDeleteId(null);
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Users</h1>
          <p>{users.length} shown{loading ? " — loading..." : ""}</p>
        </div>
      </div>

      <div className="admin-filters">
        <input className="admin-input" placeholder="Search by email..." value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
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
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: "2rem" }}>
                    No users match these filters.
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

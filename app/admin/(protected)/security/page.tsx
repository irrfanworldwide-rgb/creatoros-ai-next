"use client";

import { useEffect, useState } from "react";

interface LoginAttempt {
  id: string;
  username: string;
  success: boolean;
  ip_address: string | null;
  created_at: string;
}
interface AdminLog {
  id: string;
  admin_username: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function AdminSecurityPage() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/security")
      .then((r) => r.json())
      .then((data) => {
        setAttempts(data.attempts || []);
        setLogs(data.logs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const failedCount = attempts.filter((a) => !a.success).length;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Security</h1>
          <p>{loading ? "Loading..." : `${failedCount} failed login attempts in the last 50 events`}</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Recent Admin Login Attempts</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Result</th>
                <th>IP Address</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.username}</td>
                  <td>
                    <span className={`admin-badge ${a.success ? "active" : "halted"}`}>
                      {a.success ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{a.ip_address || "—"}</td>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && attempts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--text3)", padding: "1.5rem" }}>
                    No login attempts recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Admin Audit Log</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.admin_username || "—"}</td>
                  <td>{l.action}</td>
                  <td style={{ fontSize: 11.5 }}>
                    {l.target_type ? `${l.target_type}:${l.target_id?.slice(0, 8) ?? ""}` : "—"}
                  </td>
                  <td>{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--text3)", padding: "1.5rem" }}>
                    No admin actions logged yet.
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

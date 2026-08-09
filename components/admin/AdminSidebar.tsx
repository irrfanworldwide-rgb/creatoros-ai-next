"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", icon: "📊", label: "Dashboard" },
  { href: "/admin/users", icon: "👥", label: "Users" },
  { href: "/admin/subscriptions", icon: "💳", label: "Subscriptions" },
  { href: "/admin/security", icon: "🔒", label: "Security" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

export default function AdminSidebar({ username, role }: { username: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">CreatorOS Studio AI Admin</div>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
        >
          <span className="admin-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
      <div className="admin-sidebar-footer">
        <div style={{ fontSize: 11.5, color: "var(--text3)", padding: "0 .6rem", marginBottom: 8 }}>
          {username} · {role}
        </div>
        <div className="admin-nav-item" onClick={handleLogout} style={{ color: "var(--red)" }}>
          <span className="admin-nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
}

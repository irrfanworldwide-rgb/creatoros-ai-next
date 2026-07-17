"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home", icon: "🏠", label: "Home" },
  { href: "/tools", icon: "⚡", label: "Tools" },
  { href: "/chat", icon: "💬", label: "Chat" },
  { href: "/library", icon: "📚", label: "Library" },
  { href: "/profile", icon: "👤", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav visible">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} className={`bnav-item ${active ? "active" : ""}`}>
            <div className="bnav-indicator" />
            <span className="bnav-icon">{item.icon}</span>
            <span className="bnav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

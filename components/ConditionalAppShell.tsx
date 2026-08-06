"use client";

import { usePathname } from "next/navigation";
import AppBoot from "@/components/AppBoot";
import MaintenanceGate from "@/components/MaintenanceGate";

// The authenticated-app section of the site — same route set BottomNav
// already treats as "the app." Only these get the splash/loading
// animation; public pages (landing, legal, contact) render immediately.
const AUTHENTICATED_APP_PREFIXES = ["/home", "/tools", "/chat", "/library", "/profile"];

export default function ConditionalAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // /admin gets none of this: no splash screen, no maintenance gate
  // (it must stay reachable during maintenance mode to turn it back
  // off), and no mobile-width app-shell constraint (the admin sidebar
  // needs full desktop width).
  if (isAdmin) {
    return <>{children}</>;
  }

  const isAuthenticatedApp = AUTHENTICATED_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(prefix + "/")
  );

  const content = (
    <MaintenanceGate>
      <div className="app-shell">{children}</div>
    </MaintenanceGate>
  );

  // Public pages (landing, privacy, terms, contact, etc.) render
  // immediately — no splash screen. The authenticated app still gets
  // it, exactly as before, on first entry each session.
  return isAuthenticatedApp ? <AppBoot>{content}</AppBoot> : content;
}

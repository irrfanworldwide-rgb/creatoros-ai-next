"use client";

import { usePathname } from "next/navigation";
import AppBoot from "@/components/AppBoot";
import MaintenanceGate from "@/components/MaintenanceGate";

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

  return (
    <AppBoot>
      <MaintenanceGate>
        <div className="app-shell">{children}</div>
      </MaintenanceGate>
    </AppBoot>
  );
}

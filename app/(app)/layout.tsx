import AppBoot from "@/components/AppBoot";
import MaintenanceGate from "@/components/MaintenanceGate";

// SessionProvider and ToastProvider now live in the true root layout
// (app/layout.tsx) so every route in the app — this group, /admin, and
// any Next.js-generated fallback page — has them available unconditionally.
// This layout now only adds what's specific to the user-facing app: the
// splash screen and maintenance-mode gate (deliberately NOT applied to
// /admin, which needs to stay reachable during maintenance mode) and the
// mobile-width app-shell container.

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBoot>
      <MaintenanceGate>
        <div className="app-shell">{children}</div>
      </MaintenanceGate>
    </AppBoot>
  );
}

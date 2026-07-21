import { SessionProvider } from "@/contexts/SessionContext";
import { ToastProvider } from "@/contexts/ToastContext";
import AppBoot from "@/components/AppBoot";
import MaintenanceGate from "@/components/MaintenanceGate";

// Every page in this group reads session state (directly or via
// SessionProvider's own client-side auth check) and is meaningfully
// different per visitor — none of them are good static-prerendering
// candidates to begin with. Forcing dynamic rendering here also fixes a
// known Next.js App Router issue where a Context Provider defined in a
// route-group layout can throw "must be used within Provider" during
// BUILD-TIME static prerendering, even though the actual runtime
// component tree is correctly nested (verified: every useSession() call
// in this project lives under this route group or in a hook/component
// only ever rendered from within it — not a structural bug, a
// prerendering-timing one). This tells Next.js to always render these
// routes per-request instead of attempting to pre-build static HTML for
// them, which is where the mismatch occurred.
export const dynamic = "force-dynamic";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBoot>
      <MaintenanceGate>
        <SessionProvider>
          <ToastProvider>
            <div className="app-shell">{children}</div>
          </ToastProvider>
        </SessionProvider>
      </MaintenanceGate>
    </AppBoot>
  );
}

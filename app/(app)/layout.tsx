import { SessionProvider } from "@/contexts/SessionContext";
import { ToastProvider } from "@/contexts/ToastContext";
import AppBoot from "@/components/AppBoot";
import MaintenanceGate from "@/components/MaintenanceGate";

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

import AdminPageShell from "@/components/admin/AdminPageShell";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <AdminPageShell>
      <AdminSettingsClient />
    </AdminPageShell>
  );
}

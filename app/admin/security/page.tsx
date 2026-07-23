import AdminPageShell from "@/components/admin/AdminPageShell";
import AdminSecurityClient from "@/components/admin/AdminSecurityClient";

export const dynamic = "force-dynamic";

export default function AdminSecurityPage() {
  return (
    <AdminPageShell>
      <AdminSecurityClient />
    </AdminPageShell>
  );
}

import AdminPageShell from "@/components/admin/AdminPageShell";
import AdminUsersClient from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <AdminPageShell>
      <AdminUsersClient />
    </AdminPageShell>
  );
}

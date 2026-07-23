import AdminPageShell from "@/components/admin/AdminPageShell";
import AdminSubscriptionsClient from "@/components/admin/AdminSubscriptionsClient";

export const dynamic = "force-dynamic";

export default function AdminSubscriptionsPage() {
  return (
    <AdminPageShell>
      <AdminSubscriptionsClient />
    </AdminPageShell>
  );
}

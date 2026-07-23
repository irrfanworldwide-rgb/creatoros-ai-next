import { redirect } from "next/navigation";
import { getAdminSessionFromCookies } from "@/lib/admin/requireAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminPageShell({ children }: { children: React.ReactNode }) {
  // Middleware already blocks unauthenticated requests from ever reaching
  // this component — this second check is defense in depth, not the
  // primary guard, in case middleware config ever drifts.
  const session = await getAdminSessionFromCookies();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar username={session.username} role={session.role} />
      <main className="admin-main">{children}</main>
    </div>
  );
}

import { getDashboardStats, getUserGrowthSeries, getRevenueGrowthSeries } from "@/lib/admin/stats";
import AdminChart from "@/components/admin/AdminChart";
import AdminPageShell from "@/components/admin/AdminPageShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, userGrowth, revenueGrowth] = await Promise.all([
    getDashboardStats(),
    getUserGrowthSeries(14),
    getRevenueGrowthSeries(14),
  ]);

  const cards: { label: string; value: string; icon: string; sub?: string }[] = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: "👥" },
    { label: "Active Users (7d)", value: stats.activeUsers.toLocaleString(), icon: "⚡" },
    { label: "Pro Users", value: stats.proUsers.toLocaleString(), icon: "💎" },
    { label: "Free Users", value: stats.freeUsers.toLocaleString(), icon: "🆓" },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: "💰" },
    { label: "Monthly Revenue", value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: "📅" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: "🏦" },
    { label: "AI Generations Today", value: stats.aiGenerationsToday.toLocaleString(), icon: "✨" },
    { label: "Total AI Requests", value: stats.totalAiRequests.toLocaleString(), icon: "🤖" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions.toLocaleString(), icon: "🔁" },
  ];

  return (
    <AdminPageShell>
      <div className="admin-topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Live overview of CreatorOS Studio AI</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        {cards.map((c) => (
          <div className="admin-stat-card" key={c.label}>
            <div className="admin-stat-label">
              <span>{c.icon}</span> {c.label}
            </div>
            <div className="admin-stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      <AdminChart title="User Growth (14 days)" data={userGrowth} color="#A855F7" />
      <AdminChart title="Revenue Growth (14 days)" data={revenueGrowth} color="#3fb950" prefix="₹" />
    </AdminPageShell>
  );
}

import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number; // generated something in the last 7 days
  proUsers: number;
  freeUsers: number;
  totalRevenue: number; // INR
  monthlyRevenue: number;
  todayRevenue: number;
  aiGenerationsToday: number;
  totalAiRequests: number;
  activeSubscriptions: number;
}

const PRO_PLAN_INR = 299;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
function monthStartIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const sb = getSupabaseServiceClient();

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: activeSubscriptions },
    { data: todayUsageRows },
    { count: totalAiRequests },
    { data: activeUsersRows },
    { data: allPayments },
  ] = await Promise.all([
    sb.from("profiles").select("id", { count: "exact", head: true }),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "pro"),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "active"),
    sb.from("daily_usage").select("count").eq("date", todayStr()),
    sb.from("generations").select("id", { count: "exact", head: true }),
    sb.from("daily_usage").select("user_id").gte("date", daysAgoIso(7).slice(0, 10)),
    sb.from("payments").select("created_at").eq("status", "paid"),
  ]);

  const generationsToday = (todayUsageRows || []).reduce((sum, row) => sum + (row.count || 0), 0);

  const activeUserIds = new Set((activeUsersRows || []).map((r) => r.user_id));

  const monthStart = monthStartIso();
  const today = todayStr();
  let totalRevenue = 0;
  let monthlyRevenue = 0;
  let todayRevenue = 0;
  for (const p of allPayments || []) {
    totalRevenue += PRO_PLAN_INR;
    if (p.created_at >= monthStart) monthlyRevenue += PRO_PLAN_INR;
    if (p.created_at.slice(0, 10) === today) todayRevenue += PRO_PLAN_INR;
  }

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUserIds.size,
    proUsers: proUsers ?? 0,
    freeUsers: (totalUsers ?? 0) - (proUsers ?? 0),
    totalRevenue,
    monthlyRevenue,
    todayRevenue,
    aiGenerationsToday: generationsToday,
    totalAiRequests: totalAiRequests ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
  };
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

/** Signups per day for the last N days — feeds the User Growth chart. */
export async function getUserGrowthSeries(days = 14): Promise<DailyPoint[]> {
  const sb = getSupabaseServiceClient();
  const since = daysAgoIso(days);
  const { data } = await sb.from("profiles").select("created_at").gte("created_at", since);

  return buildDailySeries(days, (data || []).map((r) => r.created_at));
}

/** Revenue (₹) per day for the last N days — feeds the Revenue Growth chart. */
export async function getRevenueGrowthSeries(days = 14): Promise<DailyPoint[]> {
  const sb = getSupabaseServiceClient();
  const since = daysAgoIso(days);
  const { data } = await sb.from("payments").select("created_at").eq("status", "paid").gte("created_at", since);

  const series = buildDailySeries(days, (data || []).map((r) => r.created_at));
  return series.map((p) => ({ ...p, value: p.value * PRO_PLAN_INR }));
}

function buildDailySeries(days: number, isoTimestamps: string[]): DailyPoint[] {
  const counts = new Map<string, number>();
  for (const ts of isoTimestamps) {
    const d = ts.slice(0, 10);
    counts.set(d, (counts.get(d) || 0) + 1);
  }
  const out: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    out.push({ date: d, value: counts.get(d) || 0 });
  }
  return out;
}

export async function logAdminAction(
  adminId: string,
  adminUsername: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  const sb = getSupabaseServiceClient();
  await sb.from("admin_logs").insert({
    admin_id: adminId,
    admin_username: adminUsername,
    action,
    target_type: targetType,
    target_id: targetId,
    details: details || null,
  });
}

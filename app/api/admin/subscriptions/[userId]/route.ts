import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { getAdminSessionFromRequest } from "@/lib/admin/requireAdmin";
import { logAdminAction } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; days?: number };
  const { action, days } = body;
  const userId = params.userId;
  const sb = getSupabaseServiceClient();

  const updates: Record<string, unknown> = {};
  if (action === "manual_activate") {
    updates.plan = "pro";
    updates.subscription_status = "active";
  } else if (action === "downgrade") {
    updates.plan = "free";
    updates.subscription_status = "cancelled";
  } else if (action === "extend") {
    const extendDays = Math.max(1, Math.min(365, Number(days) || 30));
    const { data: current } = await sb
      .from("profiles")
      .select("subscription_current_end")
      .eq("id", userId)
      .maybeSingle();
    const base = current?.subscription_current_end ? new Date(current.subscription_current_end) : new Date();
    const newEnd = new Date(Math.max(base.getTime(), Date.now()) + extendDays * 24 * 60 * 60 * 1000);
    updates.subscription_current_end = newEnd.toISOString();
    updates.plan = "pro";
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const { error } = await sb.from("profiles").update(updates).eq("id", userId);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  await logAdminAction(session.adminId, session.username, `subscription.${action}`, "user", userId, { days });
  return NextResponse.json({ success: true });
}

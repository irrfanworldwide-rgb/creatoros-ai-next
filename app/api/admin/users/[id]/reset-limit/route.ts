import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { getAdminSessionFromRequest } from "@/lib/admin/requireAdmin";
import { logAdminAction } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const userId = params.id;
  const today = new Date().toISOString().slice(0, 10);
  const sb = getSupabaseServiceClient();

  const { error } = await sb.from("daily_usage").delete().eq("user_id", userId).eq("date", today);
  if (error) return NextResponse.json({ error: "Reset failed." }, { status: 500 });

  await logAdminAction(session.adminId, session.username, "user.reset_limit", "user", userId);
  return NextResponse.json({ success: true });
}

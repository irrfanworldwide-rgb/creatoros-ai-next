import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { getAdminSessionFromRequest } from "@/lib/admin/requireAdmin";
import { logAdminAction } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabaseServiceClient();
  const { data } = await sb.from("settings").select("key, value");
  const settings: Record<string, unknown> = {};
  for (const row of data || []) settings[row.key] = row.value;
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { key?: string; value?: unknown };
  if (!body.key) return NextResponse.json({ error: "Missing key." }, { status: 400 });

  const sb = getSupabaseServiceClient();
  const { error } = await sb
    .from("settings")
    .upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  await logAdminAction(session.adminId, session.username, "settings.update", "setting", body.key, {
    value: body.value,
  });
  return NextResponse.json({ success: true });
}

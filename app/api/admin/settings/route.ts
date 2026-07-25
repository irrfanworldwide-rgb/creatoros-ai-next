import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { getAdminSessionFromRequest } from "@/lib/admin/requireAdmin";
import { logAdminAction } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

// Known keys get real validation; unknown keys are rejected outright
// rather than silently accepted, since this table also generically
// stores whatever future settings land here — an allowlist is safer
// than trying to validate arbitrary unknown shapes.
const KNOWN_SETTINGS: Record<string, (value: unknown) => string | null> = {
  maintenance_mode: (value) => (typeof value === "boolean" ? null : "maintenance_mode must be true or false."),
  free_daily_limit: (value) =>
    typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 1000
      ? null
      : "free_daily_limit must be a whole number between 1 and 1000.",
};

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

  const validator = KNOWN_SETTINGS[body.key];
  if (!validator) {
    return NextResponse.json({ error: `Unknown setting key: "${body.key}".` }, { status: 400 });
  }
  const validationError = validator(body.value);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

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

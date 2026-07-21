import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { getAdminSessionFromRequest } from "@/lib/admin/requireAdmin";
import { logAdminAction } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const { action } = body;
  const userId = params.id;
  const sb = getSupabaseServiceClient();

  const updates: Record<string, unknown> = {};
  if (action === "suspend") updates.suspended = true;
  else if (action === "reactivate") updates.suspended = false;
  else if (action === "upgrade") updates.plan = "pro";
  else if (action === "downgrade") updates.plan = "free";
  else return NextResponse.json({ error: "Unknown action." }, { status: 400 });

  const { error } = await sb.from("profiles").update(updates).eq("id", userId);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  await logAdminAction(session.adminId, session.username, `user.${action}`, "user", userId);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const userId = params.id;
  const sb = getSupabaseServiceClient();

  // Deletes the auth.users row; profiles/daily_usage/generations/payments
  // all cascade via their "on delete cascade" foreign keys.
  const { error } = await sb.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: "Delete failed." }, { status: 500 });

  await logAdminAction(session.adminId, session.username, "user.delete", "user", userId);
  return NextResponse.json({ success: true });
}

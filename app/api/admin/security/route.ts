import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabaseServiceClient();

  const [{ data: attempts }, { data: logs }] = await Promise.all([
    sb.from("admin_login_attempts").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  return NextResponse.json({ attempts: attempts || [], logs: logs || [] });
}

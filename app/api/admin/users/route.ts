import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const plan = searchParams.get("plan"); // "free" | "pro" | null
  const status = searchParams.get("status"); // "suspended" | "active" | null
  const limit = Math.min(200, Number(searchParams.get("limit")) || 100);

  const sb = getSupabaseServiceClient();
  let query = sb
    .from("profiles")
    .select("id, email, plan, suspended, subscription_status, subscription_current_end, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) query = query.ilike("email", `%${q}%`);
  if (plan === "free" || plan === "pro") query = query.eq("plan", plan);
  if (status === "suspended") query = query.eq("suspended", true);
  if (status === "active") query = query.eq("suspended", false);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Could not load users." }, { status: 500 });
  }

  return NextResponse.json({ users: data }, { headers: { "Cache-Control": "no-store" } });
}

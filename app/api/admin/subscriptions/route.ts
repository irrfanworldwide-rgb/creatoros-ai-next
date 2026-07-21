import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // active | cancelled | halted | pending | completed | expired

  const sb = getSupabaseServiceClient();
  let query = sb
    .from("profiles")
    .select("id, email, plan, razorpay_subscription_id, subscription_status, subscription_current_end")
    .not("razorpay_subscription_id", "is", null)
    .order("subscription_current_end", { ascending: true });

  if (status) query = query.eq("subscription_status", status);

  const { data: subs, error } = await query;
  if (error) return NextResponse.json({ error: "Could not load subscriptions." }, { status: 500 });

  // Last payment per user, for a simple "Payment Status" indicator.
  const userIds = (subs || []).map((s) => s.id);
  const lastPayments = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: payments } = await sb
      .from("payments")
      .select("user_id, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });
    for (const p of payments || []) {
      if (!lastPayments.has(p.user_id)) lastPayments.set(p.user_id, p.created_at);
    }
  }

  const result = (subs || []).map((s) => ({ ...s, last_payment_at: lastPayments.get(s.id) || null }));
  return NextResponse.json({ subscriptions: result });
}

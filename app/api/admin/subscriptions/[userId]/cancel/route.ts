import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { getAdminSessionFromRequest } from "@/lib/admin/requireAdmin";
import { logAdminAction } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const userId = params.userId;
  const sb = getSupabaseServiceClient();

  const { data: profile } = await sb
    .from("profiles")
    .select("razorpay_subscription_id")
    .eq("id", userId)
    .maybeSingle();

  const subscriptionId = profile?.razorpay_subscription_id as string | undefined;
  if (!subscriptionId) {
    return NextResponse.json({ error: "No subscription found for this user." }, { status: 400 });
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 });
  }

  try {
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${basicAuth}` },
      body: JSON.stringify({ cancel_at_cycle_end: 1 }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error("Admin cancel-subscription error:", errText);
      return NextResponse.json({ error: "Razorpay cancellation failed." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Could not reach Razorpay." }, { status: 502 });
  }

  await sb.from("profiles").update({ subscription_status: "cancelled" }).eq("id", userId);
  await logAdminAction(session.adminId, session.username, "subscription.admin_cancel", "user", userId);

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, getUserScopedClient } from "@/lib/supabase/serverAuth";
import { RazorpayError } from "@/lib/razorpay/client";

export const dynamic = "force-dynamic";

function getCredentials(): { keyId: string; keySecret: string } {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new RazorpayError("Razorpay is not configured.", 500);
  }
  return { keyId, keySecret };
}

export async function POST(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const sb = getUserScopedClient(token);

  const { data: profile } = await sb
    .from("profiles")
    .select("razorpay_subscription_id, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const subscriptionId = profile?.razorpay_subscription_id as string | undefined;
  if (!subscriptionId) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
  }
  if (profile?.subscription_status === "cancelled") {
    return NextResponse.json({ error: "Subscription is already cancelled." }, { status: 400 });
  }

  try {
    const { keyId, keySecret } = getCredentials();
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    // cancel_at_cycle_end: true — stop future billing, but the customer
    // keeps Pro access (and Razorpay keeps the subscription "active")
    // until the current paid cycle actually ends, per the requirement
    // that cancellation shouldn't cut off access early.
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ cancel_at_cycle_end: 1 }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error("Razorpay cancel-subscription error:", errText);
      return NextResponse.json({ error: "Could not cancel subscription. Please try again." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Could not reach Razorpay. Please try again." }, { status: 502 });
  }

  // Mark as "pending cancellation" locally — the webhook's
  // subscription.cancelled event will confirm this once Razorpay
  // actually processes it, which may not be instant.
  await sb.from("profiles").update({ subscription_status: "cancelled" }).eq("id", user.id);

  return NextResponse.json({ success: true });
}

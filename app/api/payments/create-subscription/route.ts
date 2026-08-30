import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, getUserScopedClient } from "@/lib/supabase/serverAuth";
import { createRazorpaySubscription, RazorpayError } from "@/lib/razorpay/client";

// Never cache — every request is user-specific and security-sensitive.
export const dynamic = "force-dynamic";

// Total number of monthly charges Razorpay will attempt before the
// subscription naturally completes. Razorpay requires a finite count —
// there's no literal "forever." 120 months (10 years) is effectively
// unlimited for a monthly SaaS plan; the subscription can still be
// cancelled at any time before that via /api/payments/cancel-subscription.
const TOTAL_BILLING_CYCLES = 120;

export async function POST(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    return NextResponse.json(
      { error: "Subscriptions are not configured yet. RAZORPAY_PLAN_ID is missing. See SETUP.md." },
      { status: 500 }
    );
  }

  try {
    const subscription = await createRazorpaySubscription(planId, TOTAL_BILLING_CYCLES, {
      user_id: user.id,
      plan: "pro",
    });

    // Link the subscription to this user immediately — status "created"
    // only, NOT pro/active. This does not grant Pro access; it exists so
    // the webhook (a reliable server-side fallback, since Razorpay calls
    // it directly rather than relying on the customer's browser) can find
    // the right profile even if the client never completes
    // verify-subscription — e.g. the checkout tab is backgrounded during
    // a mobile UPI payment approval and the success handler never fires.
    // Pro activation itself still only ever happens after a verified
    // Razorpay signature, in verify-subscription or the webhook below.
    const sb = getUserScopedClient(token);
    const { error: linkError } = await sb
      .from("profiles")
      .update({ razorpay_subscription_id: subscription.id, subscription_status: "created" })
      .eq("id", user.id);
    if (linkError) {
      // Non-fatal — checkout can still proceed and verify-subscription
      // will attempt the same write again on success. Logged so a
      // recurring failure here (which would silently reintroduce this
      // exact bug) is visible in server logs.
      // eslint-disable-next-line no-console
      console.error("Failed to link subscription to profile at creation:", linkError.message);
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
    });
  } catch (err) {
    if (err instanceof RazorpayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not start subscription checkout. Please try again." }, { status: 500 });
  }
}

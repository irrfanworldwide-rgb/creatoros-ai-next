import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken } from "@/lib/supabase/serverAuth";
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

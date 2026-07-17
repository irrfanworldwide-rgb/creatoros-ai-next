import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken } from "@/lib/supabase/serverAuth";
import { createRazorpayOrder, RazorpayError } from "@/lib/razorpay/client";

// Never cache these endpoints — every request is user-specific and
// security-sensitive (AI generation usage, payment verification).
export const dynamic = "force-dynamic";
import { PRO_PLAN_PAISE, CURRENCY } from "@/lib/payments/constants";

export async function POST(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const order = await createRazorpayOrder(PRO_PLAN_PAISE, CURRENCY, {
      user_id: user.id,
      plan: "pro",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    if (err instanceof RazorpayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}

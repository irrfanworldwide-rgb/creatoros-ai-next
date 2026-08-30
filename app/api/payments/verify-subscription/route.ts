import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, getUserScopedClient } from "@/lib/supabase/serverAuth";
import { verifyRazorpaySubscriptionSignature, RazorpayError } from "@/lib/razorpay/client";

export const dynamic = "force-dynamic";

interface VerifyBody {
  razorpay_subscription_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
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

  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  let signatureValid: boolean;
  try {
    signatureValid = verifyRazorpaySubscriptionSignature(razorpay_subscription_id, razorpay_payment_id, razorpay_signature);
  } catch (err) {
    if (err instanceof RazorpayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not verify payment. Please try again." }, { status: 500 });
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  const sb = getUserScopedClient(token);

  const { error: updateError } = await sb
    .from("profiles")
    .update({
      plan: "pro",
      razorpay_subscription_id,
      subscription_status: "active",
    })
    .eq("id", user.id);

  if (updateError) {
    // eslint-disable-next-line no-console
    console.error("Verified payment but profile activation failed:", updateError.message);
    return NextResponse.json({ error: "Payment verified but activation failed. Contact support." }, { status: 500 });
  }

  // Best-effort audit log — the webhook's subscription.charged event
  // also logs this same payment; razorpay_payment_id's unique constraint
  // means whichever write lands first wins and the second is a no-op,
  // not a duplicate row.
  await sb.from("payments").insert({
    user_id: user.id,
    razorpay_payment_id,
    razorpay_subscription_id,
    status: "paid",
  });

  return NextResponse.json({ success: true, plan: "pro" });
}

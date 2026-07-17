import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, getUserScopedClient } from "@/lib/supabase/serverAuth";
import { verifyRazorpaySignature, RazorpayError } from "@/lib/razorpay/client";

// Never cache these endpoints — every request is user-specific and
// security-sensitive (AI generation usage, payment verification).
export const dynamic = "force-dynamic";

interface VerifyBody {
  razorpay_order_id?: string;
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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  let signatureValid: boolean;
  try {
    signatureValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  } catch (err) {
    if (err instanceof RazorpayError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not verify payment. Please try again." }, { status: 500 });
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  // Signature is valid — upgrade the plan. Uses a client authenticated AS
  // this user, so the update goes through the same "profiles: update own"
  // RLS policy a normal client-side request would — no service-role key.
  const sb = getUserScopedClient(token);

  const { error: updateError } = await sb.from("profiles").update({ plan: "pro" }).eq("id", user.id);
  if (updateError) {
    return NextResponse.json({ error: "Payment verified but plan upgrade failed. Contact support." }, { status: 500 });
  }

  // Best-effort audit log — doesn't block the upgrade if it fails.
  await sb.from("payments").insert({
    user_id: user.id,
    razorpay_order_id,
    razorpay_payment_id,
    status: "paid",
  });

  return NextResponse.json({ success: true, plan: "pro" });
}

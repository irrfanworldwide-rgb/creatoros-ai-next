import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature, RazorpayError } from "@/lib/razorpay/client";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    subscription?: { entity?: { id?: string; status?: string; current_end?: number; notes?: { user_id?: string } } };
    payment?: { entity?: { id?: string; order_id?: string } };
  };
}

// Events that mean "the user should have Pro access."
const ACTIVE_STATUSES = new Set(["subscription.activated", "subscription.charged"]);
// Events that mean "the user should NOT have Pro access anymore."
const INACTIVE_EVENTS = new Set(["subscription.cancelled", "subscription.halted", "subscription.completed", "subscription.expired"]);

export async function POST(req: NextRequest) {
  // CRITICAL: signature must be computed over the exact raw body Razorpay
  // sent — req.json() would parse-then-restringify and can produce a
  // different byte sequence (whitespace/key order), breaking verification
  // even for a genuine request. Always read as text first.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let signatureValid: boolean;
  try {
    signatureValid = verifyRazorpayWebhookSignature(rawBody, signature);
  } catch (err) {
    if (err instanceof RazorpayError) {
      // eslint-disable-next-line no-console
      console.error("Webhook config error:", err.message);
      return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
    }
    return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventId = req.headers.get("x-razorpay-event-id");
  const sb = getSupabaseServiceClient();

  // --- Idempotency: Razorpay deliberately retries webhook delivery on
  // timeout/non-2xx, so the SAME event can arrive more than once. Record
  // it first; if we've already processed this exact event id, stop here
  // without re-applying the effect (e.g. re-inserting a payment row or
  // re-toggling a plan).
  if (eventId) {
    const { error: insertError } = await sb
      .from("webhook_events")
      .insert({ razorpay_event_id: eventId, event_type: payload.event });
    if (insertError) {
      // Unique constraint violation = already processed this event.
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  const subscriptionEntity = payload.payload.subscription?.entity;
  const subscriptionId = subscriptionEntity?.id;
  const paymentId = payload.payload.payment?.entity?.id;

  if (!subscriptionId) {
    // Not a subscription-related event we need to act on (e.g. a plain
    // one-time order webhook, if those are ever enabled too) — ack and
    // move on rather than erroring.
    return NextResponse.json({ received: true });
  }

  // Find which user this subscription belongs to. We stored it on the
  // profile at creation/first-verification time — this lookup, not
  // anything in the webhook payload's notes, is the trusted source,
  // since notes could theoretically be tampered with before signature
  // generation on Razorpay's side in edge cases. Matching against our
  // own DB record is the safer join.
  const { data: profile } = await sb
    .from("profiles")
    .select("id")
    .eq("razorpay_subscription_id", subscriptionId)
    .maybeSingle();

  if (!profile) {
    // Subscription not associated with any user yet (e.g. webhook for
    // subscription.created arriving before our verify-subscription
    // route has run) — nothing to update, ack and move on.
    return NextResponse.json({ received: true });
  }

  const currentEnd = subscriptionEntity?.current_end
    ? new Date(subscriptionEntity.current_end * 1000).toISOString()
    : null;

  if (ACTIVE_STATUSES.has(payload.event)) {
    const { error: activateError } = await sb
      .from("profiles")
      .update({
        plan: "pro",
        subscription_status: "active",
        subscription_current_end: currentEnd,
      })
      .eq("id", profile.id);
    if (activateError) {
      // This is the case that matters most to catch: a genuinely verified
      // payment where activation itself then failed — invisible before
      // this log line existed.
      // eslint-disable-next-line no-console
      console.error("Webhook: Pro activation write failed for a verified payment:", activateError.message);
    }

    if (paymentId) {
      // Best-effort — unique constraint on razorpay_payment_id means a
      // payment already logged by verify-subscription's optimistic
      // write is a harmless no-op here, not a duplicate.
      await sb.from("payments").insert({
        user_id: profile.id,
        razorpay_payment_id: paymentId,
        razorpay_subscription_id: subscriptionId,
        status: "paid",
      });
    }
  } else if (payload.event === "subscription.pending") {
    // A renewal charge failed but Razorpay will retry automatically —
    // keep Pro access for now, just reflect the at-risk status so the
    // UI can prompt the user to check their payment method.
    await sb.from("profiles").update({ subscription_status: "pending" }).eq("id", profile.id);
  } else if (INACTIVE_EVENTS.has(payload.event)) {
    await sb
      .from("profiles")
      .update({
        plan: "free",
        subscription_status: payload.event.replace("subscription.", ""),
      })
      .eq("id", profile.id);
  }

  return NextResponse.json({ received: true });
}

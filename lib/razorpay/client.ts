import crypto from "crypto";

export class RazorpayError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "RazorpayError";
  }
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpaySubscription {
  id: string;
  plan_id: string;
  status: string;
  short_url: string;
}

function getCredentials(): { keyId: string; keySecret: string } {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new RazorpayError(
      "NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set. Add both to .env.local and restart the dev server. See SETUP.md.",
      500
    );
  }
  return { keyId, keySecret };
}

/**
 * Creates a Razorpay order server-side (uses the secret key — this must
 * never run in the browser). `notes` is used to stash the Supabase user
 * id on the order so the verify step can double-check consistency, even
 * though the authoritative user identity always comes from the caller's
 * verified access token, not from these notes.
 */
export async function createRazorpayOrder(
  amountPaise: number,
  currency: string,
  notes: Record<string, string>
): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getCredentials();
  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  let res: Response;
  try {
    res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: `creatoros_${Date.now()}`,
        notes,
      }),
    });
  } catch {
    throw new RazorpayError("Could not reach Razorpay. Check your network connection.", 502);
  }

  if (res.status === 401) {
    throw new RazorpayError(
      "Razorpay rejected the API key (401). Check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env.local.",
      500
    );
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new RazorpayError(`Razorpay order creation failed (${res.status}): ${errText.slice(0, 300)}`, 502);
  }

  return (await res.json()) as RazorpayOrder;
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay returns after checkout,
 * exactly per Razorpay's documented scheme: signature is
 * HMAC_SHA256(order_id + "|" + payment_id, key_secret). Never trust a
 * "payment succeeded" claim from the client without this check — it's
 * the only proof the payment is real.
 */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const { keySecret } = getCredentials();
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");

  // Constant-time comparison to avoid timing attacks.
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Creates a Razorpay subscription server-side — this is what actually
 * makes billing recurring (Razorpay auto-charges the customer's saved
 * payment method every billing cycle per the Plan, no manual "Upgrade"
 * click needed after the first payment). Requires a Plan already created
 * in the Razorpay Dashboard (RAZORPAY_PLAN_ID).
 */
export async function createRazorpaySubscription(
  planId: string,
  totalCount: number,
  notes: Record<string, string>
): Promise<RazorpaySubscription> {
  const { keyId, keySecret } = getCredentials();
  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  let res: Response;
  try {
    res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: totalCount,
        quantity: 1,
        customer_notify: 1,
        notes,
      }),
    });
  } catch {
    throw new RazorpayError("Could not reach Razorpay. Check your network connection.", 502);
  }

  if (res.status === 401) {
    throw new RazorpayError(
      "Razorpay rejected the API key (401). Check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env.local.",
      500
    );
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new RazorpayError(`Razorpay subscription creation failed (${res.status}): ${errText.slice(0, 300)}`, 502);
  }

  return (await res.json()) as RazorpaySubscription;
}

/**
 * Verifies the signature Razorpay's checkout returns after the FIRST
 * subscription payment. Note this is a different formula than the
 * one-time order flow: HMAC_SHA256(payment_id + "|" + subscription_id,
 * key_secret) — payment_id comes first here, reversed from the order
 * flow's order_id + "|" + payment_id. Getting this order wrong is the
 * most common subscription-integration bug.
 */
export function verifyRazorpaySubscriptionSignature(
  subscriptionId: string,
  paymentId: string,
  signature: string
): boolean {
  const { keySecret } = getCredentials();
  const expected = crypto.createHmac("sha256", keySecret).update(`${paymentId}|${subscriptionId}`).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Verifies an incoming webhook actually came from Razorpay (not a forged
 * request). Uses a SEPARATE secret from the API key pair — the Webhook
 * Secret you set when registering the webhook URL in the Razorpay
 * Dashboard (Settings → Webhooks). Signature = HMAC_SHA256(raw request
 * body, webhook secret), sent in the X-Razorpay-Signature header.
 * MUST be computed over the raw, unparsed request body — parsing to
 * JSON and re-stringifying can change whitespace/key order and produce
 * a signature mismatch even for a genuine request.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new RazorpayError(
      "RAZORPAY_WEBHOOK_SECRET is not set. Add it to .env.local and restart the dev server. See SETUP.md.",
      500
    );
  }
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

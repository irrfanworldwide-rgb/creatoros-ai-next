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

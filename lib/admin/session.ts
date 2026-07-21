export interface AdminSessionPayload {
  adminId: string;
  username: string;
  role: "admin" | "superadmin";
  exp: number; // epoch ms
}

const encoder = new TextEncoder();

function toBase64Url(bytes: string): string {
  return btoa(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  const padLength = (4 - (str.length % 4)) % 4;
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
  return atob(padded);
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(String.fromCharCode(...new Uint8Array(sigBuf)));
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to .env.local and restart. See SETUP.md.");
  }
  return secret;
}

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export async function createAdminSessionToken(
  adminId: string,
  username: string,
  role: "admin" | "superadmin"
): Promise<string> {
  const secret = getSecret();
  const payload: AdminSessionPayload = { adminId, username, role, exp: Date.now() + SESSION_DURATION_MS };
  const bodyB64 = toBase64Url(JSON.stringify(payload));
  const signature = await sign(bodyB64, secret);
  return `${bodyB64}.${signature}`;
}

/** Returns the decoded payload if the token is validly signed and not expired, else null. */
export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const secret = getSecret();
    const [bodyB64, signature] = token.split(".");
    if (!bodyB64 || !signature) return null;

    const expectedSig = await sign(bodyB64, secret);
    if (expectedSig.length !== signature.length) return null;
    // Simple constant-length comparison — crypto.subtle already gives us
    // strong forgery resistance via HMAC; Edge runtime has no
    // crypto.timingSafeEqual equivalent, so this is the practical
    // approach available in both runtimes this code needs to run in.
    let mismatch = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      mismatch |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (mismatch !== 0) return null;

    const payload = JSON.parse(fromBase64Url(bodyB64)) as AdminSessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (!payload.adminId || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_COOKIE = "creatoros_admin_session";

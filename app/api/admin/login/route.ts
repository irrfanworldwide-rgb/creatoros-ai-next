import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/admin/password";
import { createAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin/session";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const { username, password } = (await req.json().catch(() => ({}))) as { username?: string; password?: string };

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const sb = getSupabaseServiceClient();
  const ip = getClientIp(req);

  // --- Brute-force protection: block if too many recent failures for
  // this username, regardless of whether the account exists (avoids
  // leaking which usernames are valid via a timing/behavior difference).
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count: recentFailures } = await sb
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("username", username)
    .eq("success", false)
    .gte("created_at", windowStart);

  if ((recentFailures ?? 0) >= MAX_FAILED_ATTEMPTS) {
    await sb.from("admin_login_attempts").insert({ username, success: false, ip_address: ip });
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${LOCKOUT_WINDOW_MINUTES} minutes.` },
      { status: 429 }
    );
  }

  const { data: admin } = await sb
    .from("admin_users")
    .select("id, username, password_hash, password_salt, role")
    .eq("username", username)
    .maybeSingle();

  const passwordOk = admin ? verifyPassword(password, admin.password_hash, admin.password_salt) : false;

  await sb.from("admin_login_attempts").insert({ username, success: passwordOk, ip_address: ip });

  if (!admin || !passwordOk) {
    // Same generic message whether the username doesn't exist or the
    // password is wrong — don't help an attacker enumerate usernames.
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await createAdminSessionToken(admin.id, admin.username, admin.role as "admin" | "superadmin");

  await sb.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id);
  await sb.from("admin_logs").insert({
    admin_id: admin.id,
    admin_username: admin.username,
    action: "login",
    ip_address: ip,
  });

  const res = NextResponse.json({ success: true, role: admin.role });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours, matches session.ts's SESSION_DURATION_MS
  });
  return res;
}

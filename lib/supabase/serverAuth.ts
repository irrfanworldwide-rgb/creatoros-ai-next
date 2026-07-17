import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

/**
 * Resolves a Supabase access token to a real, currently-valid user by
 * asking the Supabase Auth server directly. Never trust a client-supplied
 * user id for anything security-sensitive (like crediting a payment) —
 * always derive it from a verified token instead.
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  const sb = createClient(SB_URL, SB_ANON_KEY);
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Returns a Supabase client authenticated AS the given user (via their
 * access token), so writes go through Row Level Security exactly as if
 * the user made them directly from the browser — no service-role key
 * needed or used anywhere in the payments flow.
 */
export function getUserScopedClient(accessToken: string) {
  return createClient(SB_URL, SB_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

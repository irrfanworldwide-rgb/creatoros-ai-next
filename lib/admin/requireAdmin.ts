import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE, type AdminSessionPayload } from "@/lib/admin/session";

/** For use in Server Components / layouts (reads from next/headers cookies()). */
export async function getAdminSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

/** For use in Route Handlers (app/api/admin/**), which get a NextRequest instead. */
export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSessionPayload | null> {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page and login API endpoint must stay reachable without a
  // session — everything else under /admin and /api/admin requires one.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return pathname.startsWith("/api/admin")
      ? NextResponse.json({ error: "Not authenticated." }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const session = await verifyAdminSessionToken(token);
  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete(ADMIN_SESSION_COOKIE); // clear an invalid/expired cookie
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

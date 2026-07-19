import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function isValidToken(token, secretName) {
  if (!token) return false;
  const secret = process.env[secretName];
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

const PROTECTED_USER_PATHS = ["/dashboard", "/tasks", "/goals", "/water", "/sleep", "/settings"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // /onboarding is the public entry point (mobile + OTP + profile all live
  // there now) — no cookie required to reach it. The page itself redirects
  // already-logged-in visitors straight to /dashboard.

  if (PROTECTED_USER_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const hasSession = await isValidToken(request.cookies.get("session")?.value, "SESSION_SECRET");
    if (!hasSession) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const hasAdminSession = await isValidToken(
      request.cookies.get("admin_session")?.value,
      "ADMIN_SESSION_SECRET"
    );
    if (!hasAdminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/goals/:path*",
    "/water/:path*",
    "/sleep/:path*",
    "/settings/:path*",
    "/admin",
    "/admin/:path*",
  ],
};

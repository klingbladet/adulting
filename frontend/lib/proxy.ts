import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  // In demo mode, allow access without requiring actual backend cookies
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/dashboard", "/account", "/creator", "/admin"];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/creator/:path*", "/admin/:path*"],
};

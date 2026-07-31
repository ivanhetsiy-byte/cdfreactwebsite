import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Site-wide maintenance gate.
 * Set to `false` (or remove this file) to restore normal routing.
 */
const MAINTENANCE_MODE = true;

export function proxy(request: NextRequest) {
  if (!MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/maintenance", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next internals and static assets so the
     * maintenance page can still load logos, fonts, and CSS.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff2?)$).*)",
  ],
};

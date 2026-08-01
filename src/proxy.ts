import { NextResponse, type NextRequest } from "next/server";

import { isMaintenanceMode } from "@/lib/maintenance";

/**
 * Site-wide maintenance gate (production only by default).
 * Local `next dev` skips this. Set MAINTENANCE_MODE=false to disable in production.
 */
export function proxy(request: NextRequest) {
  if (!isMaintenanceMode()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/maintenance", request.url));
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

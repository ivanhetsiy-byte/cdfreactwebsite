import { NextResponse, type NextRequest } from "next/server";

import {
  hasValidPreviewCookie,
  isMaintenanceMode,
  PREVIEW_COOKIE,
} from "@/lib/maintenance";

/**
 * Site-wide maintenance gate (production on by default).
 * Local `next dev` skips this unless MAINTENANCE_MODE=true.
 * Set MAINTENANCE_MODE=false to disable in production.
 * A valid `cdf-preview` cookie (set via the maintenance secret code) bypasses the gate.
 */
export async function proxy(request: NextRequest) {
  if (!isMaintenanceMode()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  const preview = request.cookies.get(PREVIEW_COOKIE)?.value;
  if (await hasValidPreviewCookie(preview)) {
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

import type { ReactNode } from "react";

/**
 * Route template — page body only.
 * Cover/reveal lives in PageTransition (SiteShell) so the overlay
 * survives template remounts across navigations.
 */
export default function RouteTemplate({ children }: { children: ReactNode }) {
  return <div className="relative z-10 w-full">{children}</div>;
}

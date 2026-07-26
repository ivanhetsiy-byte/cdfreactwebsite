"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Route template — page body only.
 * Cover/reveal lives in PageTransition (LabShell) so the overlay
 * survives template remounts across navigations.
 */
export default function RouteTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLab = pathname.startsWith("/lab");

  if (isLab) {
    return <>{children}</>;
  }

  return <div className="relative z-10 w-full">{children}</div>;
}

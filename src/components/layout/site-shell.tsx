import type { ReactNode } from "react";

import { SiteChrome } from "@/components/layout/site-chrome";

/**
 * Production site chrome. Server wrapper so page children stay RSC slots;
 * pathname variants live in the client `SiteChrome` island.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}

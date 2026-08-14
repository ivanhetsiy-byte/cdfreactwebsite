"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SiteStatusBar } from "@/components/layout/site-status-bar";
import { PageTransition } from "@/components/loading/PageTransition";

const SelectionHighlight = dynamic(
  () =>
    import("@/components/providers/SelectionHighlight").then(
      (m) => m.SelectionHighlight,
    ),
  { ssr: false },
);

/**
 * Site chrome wrapper. Isolates `/admin` (local-only) from production chrome.
 */
export function LabShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isMaintenance = pathname === "/maintenance";
  const isStore =
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname === "/bag";
  const showBag =
    pathname === "/store" || pathname.startsWith("/store/");
  const forceDark = isStore;

  // Maintenance keeps site navbar (logo) but skips footer/status chrome.
  if (isAdmin) {
    return <>{children}</>;
  }

  if (isMaintenance) {
    return (
      <div className="relative w-full min-h-screen dark bg-black text-white">
        <Navbar />
        {children}
      </div>
    );
  }

  // Status bar is fixed; reserve bottom space only where it shows (md+, or store bag on mobile).
  const statusBarPad = showBag ? "pb-28" : "max-md:pb-0 md:pb-28";

  return (
    <PageTransition>
      <div
        className={`relative w-full min-h-screen ${statusBarPad} ${
          forceDark
            ? "dark bg-black text-white"
            : "bg-white text-black dark:bg-black dark:text-white"
        }`}
      >
        <Navbar />
        {children}
        <Footer />
        <SiteStatusBar />
      </div>
      <SelectionHighlight />
    </PageTransition>
  );
}

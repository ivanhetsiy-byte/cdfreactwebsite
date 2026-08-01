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
 * Isolates `/lab/*` from production chrome so sandbox pages own their UI/scroll.
 */
export function LabShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLab = pathname.startsWith("/lab");
  const isMaintenance = pathname === "/maintenance";
  const isStaff = pathname === "/staff";
  const isStore =
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname === "/bag";
  const forceDark = isStaff || isStore;

  // Maintenance keeps site navbar (logo) but skips footer/status chrome.
  if (isLab) {
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

  return (
    <PageTransition>
      <div
        className={`relative w-full min-h-screen pb-28 ${
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

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SiteStatusBar } from "@/components/layout/site-status-bar";
import { FirstVisitLoader } from "@/components/loading/FirstVisitLoader";
import { SelectionHighlight } from "@/components/providers/SelectionHighlight";

/**
 * Isolates `/lab/*` from production chrome so sandbox pages own their UI/scroll.
 */
export function LabShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLab = pathname.startsWith("/lab");
  const isStaff = pathname === "/staff";
  const isStore =
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname === "/bag";
  const forceDark = isStaff || isStore;

  if (isLab) {
    return <>{children}</>;
  }

  return (
    <>
      <FirstVisitLoader />
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
    </>
  );
}

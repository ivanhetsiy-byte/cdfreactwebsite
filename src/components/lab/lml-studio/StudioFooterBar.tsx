"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { SiteStatusBar } from "@/components/layout/site-status-bar";
import { requestRouteCover } from "@/lib/route-cover";

function useDelayedNav() {
  const pathname = usePathname();
  const router = useRouter();
  const lockRef = useRef(false);

  return (targetPath: string) => {
    if (targetPath === pathname || lockRef.current) return;
    lockRef.current = true;
    if (targetPath === "/") sessionStorage.setItem("fromSubpage", "true");
    requestRouteCover();
    setTimeout(() => {
      router.push(targetPath);
      lockRef.current = false;
    }, 500);
  };
}

type StudioFooterBarProps = {
  /** Lab Contact pill — hide when site chrome already has Contact. */
  showContactCta?: boolean;
  /**
   * When false, skip the sticky meta strip (site shell already mounts
   * `SiteStatusBar` globally). Lab chrome still needs it.
   */
  showStatusBar?: boolean;
};

/**
 * Lab-only chrome: optional sticky meta + Contact pill.
 * Production sticky bar + closing footer live in LabShell.
 */
export function StudioFooterBar({
  showContactCta = true,
  showStatusBar = true,
}: StudioFooterBarProps) {
  const go = useDelayedNav();

  return (
    <>
      {showStatusBar ? <SiteStatusBar /> : null}

      {showContactCta ? (
        <div className="fixed right-0 bottom-0 z-[1001] hidden py-3 md:block md:pr-4">
          <Link
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              go("/contact");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Contact
          </Link>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";

/**
 * Shared delayed navigation that waits for the white fade cover.
 */
export function useDelayedNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const navLockRef = useRef(false);

  const go = useCallback(
    (targetPath: string) => {
      if (typeof window === "undefined") return;
      if (targetPath === pathname || navLockRef.current) return;

      navLockRef.current = true;

      requestRouteCover();

      setTimeout(() => {
        router.push(targetPath);
        navLockRef.current = false;
      }, ROUTE_COVER_MS);
    },
    [pathname, router],
  );

  return go;
}

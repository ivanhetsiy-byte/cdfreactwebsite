"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import "lenis/dist/lenis.css";

type LenisWindow = Window & { lenis: Lenis };

/**
 * Snap the viewport to (0,0) when a route transition begins so the incoming
 * page sheet always mounts at the absolute top edge — no layout jumps.
 */
function resetScrollToTop() {
  if (typeof window === "undefined") return;

  const lenis = (window as unknown as Partial<LenisWindow>).lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(0, { immediate: true });
    return;
  }

  window.scrollTo(0, 0);
}

/**
 * Window-level Lenis — no nested scroll shell. Document scroll moves the page
 * canvas (and its absolute navbar overlay) off-screen; only fixed chrome
 * (e.g. back-to-top) stays pinned to the monitor viewport.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFirstPathEffect = useRef(true);

  useEffect(() => {
    window.history.scrollRestoration = "manual";

    const instance = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    instance.scrollTo(0, { immediate: true });

    (window as unknown as LenisWindow).lenis = instance;

    let rafId = 0;
    const raf = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      instance.destroy();
      const win = window as unknown as LenisWindow;
      if (win.lenis === instance) {
        (window as Window & { lenis: Record<string, unknown> }).lenis = {};
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstPathEffect.current) {
      isFirstPathEffect.current = false;
      return;
    }

    // Home owns scroll when returning from a subpage (bottom → top entrance).
    try {
      if (sessionStorage.getItem("fromSubpage") === "true") return;
    } catch {
      // sessionStorage unavailable
    }

    resetScrollToTop();
  }, [pathname]);

  return <>{children}</>;
}

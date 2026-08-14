"use client";

import { useEffect } from "react";

import { Hero } from "@/components/sections/hero";
import { HomeWireframes } from "@/components/sections/home-page";
import { MissionStatement } from "@/components/sections/mission-statement";
import { getLenis, quinticEase } from "@/lib/lenis";

export default function Home() {
  // Boot at (0,0). Lenis stays running; no freeze / passive:false first-scroll lock.
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.history.scrollRestoration = "manual";

    let rafId = 0;
    let attempts = 0;

    const syncLenis = () => {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        lenis.start();
        return;
      }
      if (attempts++ < 120) {
        rafId = requestAnimationFrame(syncLenis);
      }
    };

    window.scrollTo(0, 0);
    syncLenis();

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Desktop: first downward wheel near the top nudges into #mission-section.
  // Interruptible (no lock / no overlay) — user can take over immediately.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let handedOff = false;

    const handleInitialScroll = (e: WheelEvent) => {
      if (handedOff) return;
      if (e.deltaY <= 0) return;

      const y =
        (window as unknown as { lenis?: { scroll?: number } }).lenis?.scroll ??
        window.scrollY;
      // Already scrolled — don't hijack mid-page.
      if (y > 48) {
        handedOff = true;
        window.removeEventListener("wheel", handleInitialScroll);
        return;
      }

      handedOff = true;
      e.preventDefault();
      window.removeEventListener("wheel", handleInitialScroll);

      const lenis = getLenis();
      if (!lenis) return;

      lenis.scrollTo("#mission-section", {
        duration: 1.6,
        force: true,
        offset: 0,
        easing: quinticEase,
      });
    };

    window.addEventListener("wheel", handleInitialScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleInitialScroll);
    };
  }, []);

  return (
    <main
      id="main-content"
      className="relative w-full min-h-screen bg-white text-black dark:bg-black dark:text-white pt-32 px-6 pb-0 md:px-10 md:pt-44 md:pb-0"
    >
      {/* Full-bleed: cancels the main padding so the hero owns the first screen. */}
      <div className="-mx-6 -mt-32 md:-mx-10 md:-mt-44">
        <Hero />
      </div>
      <MissionStatement />
      <HomeWireframes />
    </main>
  );
}

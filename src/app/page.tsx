"use client";

import { useEffect, useRef, useState } from "react";

import { Hero } from "@/components/sections/hero";
import { HomeWireframes } from "@/components/sections/home-wireframes";
import { MissionStatement } from "@/components/sections/mission-statement";
import { expoEaseInOut, getLenis, quinticEase } from "@/lib/lenis";

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);
  /** False when arriving via in-site nav (navbar/footer set `fromSubpage`). */
  const playIntroScrollRef = useRef(true);
  /** True when we should race from the bottom of the page up to the hero. */
  const returnFromSubpageRef = useRef(false);

  // Stationary start at (0,0) behind the transition mask — or bottom→top when
  // returning from another page. Desktop freezes Lenis until first-scroll handoff.
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (sessionStorage.getItem("fromSubpage") === "true") {
        sessionStorage.removeItem("fromSubpage");
        playIntroScrollRef.current = false;
        returnFromSubpageRef.current = true;
      }
    } catch {
      // sessionStorage unavailable — keep default intro behavior
    }

    window.history.scrollRestoration = "manual";

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const freezeForIntro = isDesktop && playIntroScrollRef.current;
    const fromSubpage = returnFromSubpageRef.current;

    let rafId = 0;
    let attempts = 0;
    let returnUnlockId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const finishReturnScroll = () => {
      if (returnUnlockId !== undefined) {
        clearTimeout(returnUnlockId);
        returnUnlockId = undefined;
      }
      isAnimatingRef.current = false;
      setIsAnimating(false);
    };

    const getMaxScroll = () => {
      const doc = document.documentElement;
      const body = document.body;
      const height = Math.max(
        doc.scrollHeight,
        body.scrollHeight,
        doc.offsetHeight,
        body.offsetHeight,
      );
      return Math.max(0, height - window.innerHeight);
    };

    const snapToBottom = (lenis: NonNullable<ReturnType<typeof getLenis>>) => {
      if (lenis.resize) lenis.resize();
      const maxScroll = getMaxScroll();
      lenis.scrollTo(maxScroll, { immediate: true });
      return maxScroll;
    };

    const startReturnFromSubpage = () => {
      const lenis = getLenis();
      if (!lenis) {
        if (attempts++ < 120) {
          rafId = requestAnimationFrame(startReturnFromSubpage);
        }
        return;
      }

      lenis.start();
      isAnimatingRef.current = true;
      setIsAnimating(true);

      // Park at the true bottom while layout grows; race the instant height settles
      // (curtain is already lifting — expo ease-in keeps the first beats soft).
      const SCROLL_MS = 1200;
      const MAX_WAIT_MS = 900;
      const parkStartedAt = performance.now();
      let lastMax = -1;
      let stableFrames = 0;

      const raceToTop = () => {
        if (cancelled) return;
        const race = getLenis();
        if (!race) {
          finishReturnScroll();
          return;
        }
        snapToBottom(race);
        race.scrollTo(0, {
          duration: SCROLL_MS / 1000,
          lock: true,
          force: true,
          easing: expoEaseInOut,
          onComplete: () => {
            race.isLocked = false;
            finishReturnScroll();
          },
        });
        returnUnlockId = setTimeout(() => {
          race.isLocked = false;
          finishReturnScroll();
        }, SCROLL_MS + 150);
      };

      const parkAndMaybeRace = () => {
        if (cancelled) return;
        const active = getLenis();
        if (!active) {
          rafId = requestAnimationFrame(parkAndMaybeRace);
          return;
        }

        const maxScroll = snapToBottom(active);
        if (maxScroll === lastMax && maxScroll > window.innerHeight * 0.5) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
          lastMax = maxScroll;
        }

        const layoutReady = stableFrames >= 2;
        const timedOut = performance.now() - parkStartedAt >= MAX_WAIT_MS;

        if (!layoutReady && !timedOut) {
          rafId = requestAnimationFrame(parkAndMaybeRace);
          return;
        }

        rafId = requestAnimationFrame(raceToTop);
      };

      parkAndMaybeRace();
    };

    const syncLenis = () => {
      const lenis = getLenis();
      if (lenis) {
        if (fromSubpage) {
          startReturnFromSubpage();
          return;
        }
        lenis.scrollTo(0, { immediate: true });
        if (freezeForIntro) {
          lenis.stop();
        } else {
          lenis.start();
        }
        return;
      }
      if (attempts++ < 120) {
        rafId = requestAnimationFrame(syncLenis);
      }
    };

    if (fromSubpage) {
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(syncLenis);
      });
    } else {
      window.scrollTo(0, 0);
      syncLenis();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (returnUnlockId !== undefined) clearTimeout(returnUnlockId);
      const active = getLenis();
      if (active) active.isLocked = false;
    };
  }, []);

  // Desktop: 10ms scroll-intercept → unfreeze + luxury glide to #mission-section.
  // Mobile: skip — native scroll only. Also skip when navigating home from another page.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!playIntroScrollRef.current) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unlockTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastTouchY: number | null = null;
    let handedOff = false;

    const handleInitialScroll = (e: WheelEvent | TouchEvent) => {
      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      let deltaY = 0;
      if (e instanceof WheelEvent) {
        deltaY = e.deltaY;
      } else {
        const y = e.touches[0]?.clientY ?? 0;
        if (lastTouchY === null) {
          lastTouchY = y;
          e.preventDefault();
          return;
        }
        deltaY = lastTouchY - y;
        lastTouchY = y;
      }

      if (deltaY > 0) {
        e.preventDefault();
        if (handedOff) return;
        handedOff = true;

        window.removeEventListener("wheel", handleInitialScroll);
        window.removeEventListener("touchmove", handleInitialScroll);

        isAnimatingRef.current = true;
        setIsAnimating(true);

        timeoutId = setTimeout(() => {
          const lenis = getLenis();
          if (lenis) {
            lenis.start();

            // lock:true is required — otherwise the same wheel gesture cancels the glide.
            lenis.scrollTo("#mission-section", {
              duration: 2.8,
              lock: true,
              force: true,
              offset: 120,
              easing: quinticEase,
            });

            // Unlock towards the end (~75% of 2.8s) so the user can take over early.
            unlockTimeoutId = setTimeout(() => {
              lenis.isLocked = false;
              isAnimatingRef.current = false;
              setIsAnimating(false);
            }, 2100);
          } else {
            isAnimatingRef.current = false;
            setIsAnimating(false);
            handedOff = false;
          }
        }, 10);
      } else {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleInitialScroll, { passive: false });
    window.addEventListener("touchmove", handleInitialScroll, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", handleInitialScroll);
      window.removeEventListener("touchmove", handleInitialScroll);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (unlockTimeoutId !== undefined) clearTimeout(unlockTimeoutId);
    };
  }, []);

  return (
    <main
      id="main-content"
      className="relative w-full min-h-screen bg-white text-black dark:bg-black dark:text-white pt-32 pb-24 px-6 md:p-10 md:pt-44 select-none swiss-no-select"
    >
      {isAnimating ? (
        <div
          className="fixed inset-0 z-[9999] cursor-default"
          aria-hidden="true"
        />
      ) : null}

      <Hero />
      <MissionStatement />
      <HomeWireframes />
    </main>
  );
}

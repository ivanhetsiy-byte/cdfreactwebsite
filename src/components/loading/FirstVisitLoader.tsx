"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  LOADER_EXIT_DURATION_MS,
  LOADER_EXIT_DURATION_S,
  LOADER_FAILSAFE_MS,
  LOADER_MIN_VISIBLE_MS,
  LOADER_SHOW_DELAY_MS,
} from "@/lib/loading";

type Phase = "boot" | "visible" | "exiting" | "gone";

function waitFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.ready) {
    return Promise.resolve();
  }
  return document.fonts.ready.then(() => undefined);
}

function waitNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function FirstVisitLoader() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const readyRef = useRef(false);
  const shownAtRef = useRef<number | null>(null);
  const showDelayElapsedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let failsafeTimer: ReturnType<typeof setTimeout> | undefined;

    const beginExit = () => {
      if (cancelled) return;
      setPhase((prev) => {
        if (prev === "visible") return "exiting";
        if (prev === "boot") return "gone";
        return prev;
      });
    };

    const scheduleExitAfterMinVisible = () => {
      const shownAt = shownAtRef.current;
      if (shownAt == null) {
        beginExit();
        return;
      }
      const elapsed = Date.now() - shownAt;
      const remaining = Math.max(0, LOADER_MIN_VISIBLE_MS - elapsed);
      exitTimer = setTimeout(beginExit, remaining);
    };

    const reveal = () => {
      showDelayElapsedRef.current = true;
      shownAtRef.current = Date.now();
      setPhase("visible");
    };

    const markReady = () => {
      if (cancelled || readyRef.current) return;
      readyRef.current = true;

      if (!showDelayElapsedRef.current) {
        // Finished before the deferred show window — never flash the splash.
        setPhase("gone");
        return;
      }

      scheduleExitAfterMinVisible();
    };

    showTimer = setTimeout(() => {
      if (cancelled) return;
      showDelayElapsedRef.current = true;
      if (!readyRef.current) {
        reveal();
      }
    }, LOADER_SHOW_DELAY_MS);

    failsafeTimer = setTimeout(() => {
      markReady();
    }, LOADER_FAILSAFE_MS);

    void (async () => {
      try {
        await waitFontsReady();
        await waitNextPaint();
      } catch {
        // Ignore font/paint failures; failsafe still covers us.
      }
      markReady();
    })();

    return () => {
      cancelled = true;
      if (showTimer) clearTimeout(showTimer);
      if (exitTimer) clearTimeout(exitTimer);
      if (failsafeTimer) clearTimeout(failsafeTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "exiting") return;
    const t = setTimeout(() => setPhase("gone"), LOADER_EXIT_DURATION_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const showOverlay = phase === "visible" || phase === "exiting";
  const announce =
    phase === "visible" ? "Loading" : phase === "exiting" ? "Content loaded" : "";

  const ease = [0.22, 1, 0.36, 1] as const;
  const exitDuration = reducedMotion ? 0.2 : LOADER_EXIT_DURATION_S;

  return (
    <>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>

      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            key="first-visit-loader"
            role="status"
            aria-busy={phase === "visible"}
            aria-label="Loading"
            initial={false}
            animate={{ opacity: phase === "exiting" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: exitDuration, ease }}
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black text-white"
          >
            {/* Hairline rails */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <motion.div
                className="absolute inset-y-[14%] left-[18%] w-px origin-top bg-white/20"
                initial={reducedMotion ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.55, ease, delay: reducedMotion ? 0 : 0.05 }}
              />
              <motion.div
                className="absolute inset-y-0 left-[50%] w-px origin-top bg-white/15"
                initial={reducedMotion ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, ease, delay: reducedMotion ? 0 : 0.12 }}
              />
              <motion.div
                className="absolute inset-y-[10%] left-[78%] w-px origin-top bg-white/20"
                initial={reducedMotion ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.55, ease, delay: reducedMotion ? 0 : 0.18 }}
              />
              <motion.div
                className="absolute top-[32%] left-[8%] h-px w-[84%] origin-left bg-white/15"
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, ease, delay: reducedMotion ? 0 : 0.1 }}
              />
              <motion.div
                className="absolute top-[68%] left-0 h-px w-[62%] origin-left bg-white/15"
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease, delay: reducedMotion ? 0 : 0.2 }}
              />
            </div>

            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={
                reducedMotion ? false : { opacity: 0, scale: 0.92 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: reducedMotion ? 0.2 : 0.65,
                ease,
                delay: reducedMotion ? 0 : 0.22,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- crisp SVG brand vector */}
              <img
                src="/icons/cdf-white.svg"
                alt="CDF"
                width={104}
                height={77}
                draggable={false}
                className="h-[18vw] w-auto max-w-none object-contain select-none swiss-no-select md:h-[12vw]"
              />
            </motion.div>

            {/* Progress rule */}
            <div
              className="absolute bottom-[18%] left-[12%] right-[12%] h-px overflow-hidden bg-white/15"
              aria-hidden="true"
            >
              <motion.div
                className="h-full origin-left bg-white"
                initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: reducedMotion ? 0.2 : 1.1,
                  ease,
                  delay: reducedMotion ? 0 : 0.35,
                  repeat: reducedMotion ? 0 : Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.15,
                }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

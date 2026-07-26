"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

import { ROUTE_COVER_EVENT } from "@/lib/route-cover";

type Phase = "idle" | "covering" | "holding" | "exiting";

/** Brand red — same family as LML’s wipe accent. */
const WIPE_RED = "#C31716";
const WIPE_DARK = "#121212";

const COVER_RED_S = 0.42;
const COVER_DARK_S = 0.48;
const COVER_DARK_DELAY_S = 0.12;
const HOLD_S = 0.55;
const EXIT_DARK_S = 0.48;
const EXIT_RED_S = 0.42;
const EXIT_RED_DELAY_S = 0.1;

/**
 * LML page transition (not the initial ENTERING loader):
 * red curtain wipes up → dark panel with centered logo follows →
 * brief hold → dark lifts, red trails.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLab = pathname.startsWith("/lab");

  const [phase, setPhase] = useState<Phase>("holding");

  const phaseRef = useRef<Phase>("holding");
  const pathnameRef = useRef(pathname);
  const redRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstPath = useRef(true);
  const reducedMotionRef = useRef(false);
  const bootedRef = useRef(false);

  const setPhaseBoth = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const killTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);

  const parkBelow = useCallback(() => {
    const red = redRef.current;
    const dark = darkRef.current;
    if (!red || !dark) return;
    gsap.set([red, dark], { yPercent: 100 });
  }, []);

  const coverInstant = useCallback(() => {
    const red = redRef.current;
    const dark = darkRef.current;
    if (!red || !dark) return;
    gsap.set([red, dark], { yPercent: 0 });
  }, []);

  const playExit = useCallback(() => {
    const red = redRef.current;
    const dark = darkRef.current;
    if (!red || !dark) return;

    killTimeline();
    setPhaseBoth("holding");
    gsap.set([red, dark], { yPercent: 0 });

    if (reducedMotionRef.current) {
      parkBelow();
      setPhaseBoth("idle");
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        parkBelow();
        setPhaseBoth("idle");
      },
    });
    timelineRef.current = tl;

    tl.to({}, { duration: HOLD_S });
    tl.add(() => setPhaseBoth("exiting"));

    // Dark leads the exit upward; red trails.
    tl.to(dark, {
      yPercent: -100,
      duration: EXIT_DARK_S,
      ease: "power3.inOut",
    });
    tl.to(
      red,
      {
        yPercent: -100,
        duration: EXIT_RED_S,
        ease: "power3.inOut",
      },
      `<${EXIT_RED_DELAY_S}`,
    );
  }, [killTimeline, parkBelow, setPhaseBoth]);

  const playCover = useCallback(() => {
    const red = redRef.current;
    const dark = darkRef.current;
    if (!red || !dark) return;

    killTimeline();
    setPhaseBoth("covering");

    if (reducedMotionRef.current) {
      coverInstant();
      return;
    }

    gsap.set([red, dark], { yPercent: 100 });

    const tl = gsap.timeline();
    timelineRef.current = tl;

    tl.to(red, {
      yPercent: 0,
      duration: COVER_RED_S,
      ease: "power3.inOut",
    });
    tl.to(
      dark,
      {
        yPercent: 0,
        duration: COVER_DARK_S,
        ease: "power3.inOut",
      },
      COVER_DARK_DELAY_S,
    );
    tl.add(() => setPhaseBoth("holding"));
  }, [coverInstant, killTimeline, setPhaseBoth]);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // First paint: already covered with logo, then wipe out.
  useEffect(() => {
    if (isLab || bootedRef.current) return;
    bootedRef.current = true;
    pathnameRef.current = pathname;
    isFirstPath.current = false;
    coverInstant();
    playExit();
  }, [isLab, pathname, coverInstant, playExit]);

  useEffect(() => {
    if (isLab) {
      killTimeline();
      parkBelow();
      setPhaseBoth("idle");
      return;
    }

    if (isFirstPath.current) return;
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    playExit();
  }, [pathname, isLab, playExit, setPhaseBoth, killTimeline, parkBelow]);

  useEffect(() => {
    if (isLab) return;

    const onCover = () => playCover();
    window.addEventListener(ROUTE_COVER_EVENT, onCover);
    return () => window.removeEventListener(ROUTE_COVER_EVENT, onCover);
  }, [isLab, playCover]);

  useEffect(() => () => killTimeline(), [killTimeline]);

  if (isLab) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        role="status"
        aria-busy={phase === "covering" || phase === "holding"}
        aria-label="Loading page"
        aria-hidden={phase === "idle"}
        className="pointer-events-none fixed inset-0 z-[10100] overflow-hidden transform-gpu"
      >
        <div
          ref={redRef}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundColor: WIPE_RED,
            transform: "translate3d(0, 0%, 0)",
          }}
          aria-hidden
        />
        <div
          ref={darkRef}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            backgroundColor: WIPE_DARK,
            transform: "translate3d(0, 0%, 0)",
          }}
        >
          {/* Centered mark — matches LML page-transition face */}
          {/* eslint-disable-next-line @next/next/no-img-element -- crisp SVG brand vector */}
          <img
            src="/icons/cdf-white.svg"
            alt="cdf"
            width={104}
            height={77}
            draggable={false}
            className="h-auto w-[40vw] max-w-[280px] object-contain select-none swiss-no-select md:w-[20vw] md:max-w-[220px]"
          />
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {phase === "covering" || phase === "holding"
          ? "Loading"
          : phase === "exiting"
            ? "Content loaded"
            : ""}
      </span>
    </>
  );
}

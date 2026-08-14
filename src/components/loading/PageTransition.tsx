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

const FADE_IN_S = 0.4;
const FADE_OUT_S = 0.4;
const HOLD_S = 0.15;

/**
 * White fade page transition:
 * overlay fades in → route swaps under full white → brief hold → fade out.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  const [phase, setPhase] = useState<Phase>("holding");

  const phaseRef = useRef<Phase>("holding");
  const pathnameRef = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
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

  const parkTransparent = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.set(overlay, { opacity: 0 });
  }, []);

  const coverInstant = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.set(overlay, { opacity: 1 });
  }, []);

  const playExit = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    killTimeline();
    setPhaseBoth("holding");
    gsap.set(overlay, { opacity: 1 });

    if (reducedMotionRef.current) {
      parkTransparent();
      setPhaseBoth("idle");
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        parkTransparent();
        setPhaseBoth("idle");
      },
    });
    timelineRef.current = tl;

    tl.to({}, { duration: HOLD_S });
    tl.add(() => setPhaseBoth("exiting"));
    tl.to(overlay, {
      opacity: 0,
      duration: FADE_OUT_S,
      ease: "power2.inOut",
    });
  }, [killTimeline, parkTransparent, setPhaseBoth]);

  const playCover = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    killTimeline();
    setPhaseBoth("covering");

    if (reducedMotionRef.current) {
      coverInstant();
      setPhaseBoth("holding");
      return;
    }

    gsap.set(overlay, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => setPhaseBoth("holding"),
    });
    timelineRef.current = tl;

    tl.to(overlay, {
      opacity: 1,
      duration: FADE_IN_S,
      ease: "power2.inOut",
    });
  }, [coverInstant, killTimeline, setPhaseBoth]);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // First paint: start covered, then fade out.
  useEffect(() => {
    if (isAdmin || bootedRef.current) return;
    bootedRef.current = true;
    pathnameRef.current = pathname;
    isFirstPath.current = false;
    coverInstant();
    playExit();
  }, [isAdmin, pathname, coverInstant, playExit]);

  useEffect(() => {
    if (isAdmin) {
      killTimeline();
      parkTransparent();
      setPhaseBoth("idle");
      return;
    }

    if (isFirstPath.current) return;
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    // Only fade out if a cover was requested — skip soft navigations (e.g. mobile menu)
    if (phaseRef.current === "covering" || phaseRef.current === "holding") {
      playExit();
    }
  }, [pathname, isAdmin, playExit, setPhaseBoth, killTimeline, parkTransparent]);

  useEffect(() => {
    if (isAdmin) return;

    const onCover = () => playCover();
    window.addEventListener(ROUTE_COVER_EVENT, onCover);
    return () => window.removeEventListener(ROUTE_COVER_EVENT, onCover);
  }, [isAdmin, playCover]);

  useEffect(() => () => killTimeline(), [killTimeline]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        ref={overlayRef}
        role="status"
        aria-busy={phase === "covering" || phase === "holding"}
        aria-label="Loading page"
        aria-hidden={phase === "idle"}
        className="pointer-events-none fixed inset-0 z-[10100] bg-white will-change-[opacity] transform-gpu"
      />
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

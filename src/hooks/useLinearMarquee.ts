"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/lib/motion-env";

/** Right-to-left cruise speed in px/s. Linear, no easing. */
const AUTO_SPEED_PX_S = 36;
/** Per-frame velocity decay after a drag release (0–1). */
const DRAG_FRICTION = 0.94;
const MOMENTUM_CUTOFF = 8;

function wrapOffset(x: number, loopWidth: number) {
  if (loopWidth <= 0) return 0;
  const wrapped = x % loopWidth;
  return wrapped > 0 ? wrapped - loopWidth : wrapped;
}

/**
 * Linear RTL loop with hover-pause, desktop drag, and momentum.
 * Transform writes stay on the track ref — no React state in the ticker.
 */
export function useLinearMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const hoverPausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragOriginXRef = useRef(0);
  const dragOriginOffsetRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const lastMoveTRef = useRef(0);
  const velocityRef = useRef(0);
  const reducedRef = useRef(false);

  const measureLoop = useCallback(() => {
    const track = trackRef.current;
    const firstSet = track?.querySelector<HTMLElement>("[data-marquee-set]");
    if (!track || !firstSet) return;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    loopWidthRef.current = firstSet.offsetWidth + gap;
    offsetRef.current = wrapOffset(offsetRef.current, loopWidthRef.current);
    gsap.set(track, { x: offsetRef.current });
  }, []);

  const applyOffset = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const wrapped = wrapOffset(next, loopWidthRef.current);
    if (wrapped === offsetRef.current) return;
    offsetRef.current = wrapped;
    gsap.set(track, { x: wrapped });
  }, []);

  useEffect(() => {
    reducedRef.current = prefersReducedMotion();
    measureLoop();

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const ro = new ResizeObserver(measureLoop);
    ro.observe(viewport);

    let inView = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
      },
      { rootMargin: "80px" },
    );
    io.observe(viewport);

    const ticker = () => {
      if (!inView && !draggingRef.current) return;
      const dt = gsap.ticker.deltaRatio(60);
      const loopWidth = loopWidthRef.current;
      if (loopWidth <= 0) return;
      if (draggingRef.current) return;

      let next = offsetRef.current;
      const velocity = velocityRef.current;

      if (Math.abs(velocity) > MOMENTUM_CUTOFF) {
        next += (velocity * dt) / 60;
        velocityRef.current *= DRAG_FRICTION;
      } else {
        velocityRef.current = 0;
        if (!hoverPausedRef.current && !reducedRef.current) {
          next -= (AUTO_SPEED_PX_S * dt) / 60;
        }
      }

      applyOffset(next);
    };

    gsap.ticker.add(ticker);
    return () => {
      gsap.ticker.remove(ticker);
      ro.disconnect();
      io.disconnect();
    };
  }, [applyOffset, measureLoop]);

  const onMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    draggingRef.current = true;
    velocityRef.current = 0;
    dragOriginXRef.current = event.clientX;
    dragOriginOffsetRef.current = offsetRef.current;
    lastMoveXRef.current = event.clientX;
    lastMoveTRef.current = performance.now();
  };

  const onMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = event.clientX - dragOriginXRef.current;
    applyOffset(dragOriginOffsetRef.current + dx);

    const dt = now - lastMoveTRef.current;
    if (dt > 0) {
      velocityRef.current = ((event.clientX - lastMoveXRef.current) / dt) * 1000;
    }
    lastMoveXRef.current = event.clientX;
    lastMoveTRef.current = now;
  };

  const endDrag = () => {
    draggingRef.current = false;
  };

  const onMouseUp = () => {
    endDrag();
  };

  const onMouseLeave = () => {
    endDrag();
    hoverPausedRef.current = false;
  };

  const onMouseEnter = () => {
    hoverPausedRef.current = true;
  };

  return {
    viewportRef,
    trackRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onMouseEnter,
  };
}

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

gsap.registerPlugin(ScrollTrigger);

type ScrollSlideProps = {
  children: ReactNode;
  className?: string;
  /** Entrance direction. */
  from: "left" | "right" | "up";
  /** Travel distance — % of element size (width for x, height for y). */
  distancePercent?: number;
  scrollStart?: string;
  /** Scrub end — only used when `scrub` is true. */
  scrollEnd?: string;
  /**
   * When true, animation progress tracks scroll.
   * When false (default for synced mottos), plays once on enter.
   */
  scrub?: boolean;
  /** Play duration when not scrubbing. */
  duration?: number;
  ease?: string;
  /** Shared trigger so multiple slides start/finish together. */
  triggerRef?: RefObject<HTMLElement | null>;
  as?: "span" | "div" | "p" | "h2" | "li";
};

/**
 * Whole-block slide — scrubbed or one-shot on scroll enter.
 */
export function ScrollSlide({
  children,
  className = "",
  from,
  distancePercent = 45,
  scrollStart = "top 85%",
  scrollEnd = "top 35%",
  scrub = true,
  duration = 1.15,
  ease = "power3.out",
  triggerRef,
  as: Tag = "span",
}: ScrollSlideProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, { xPercent: 0, yPercent: 0, opacity: 1 });
      return;
    }

    const fromVars =
      from === "up"
        ? { yPercent: distancePercent, opacity: 0 }
        : {
            xPercent: from === "left" ? -distancePercent : distancePercent,
            opacity: 0,
          };

    const toVars =
      from === "up"
        ? { yPercent: 0, opacity: 1 }
        : { xPercent: 0, opacity: 1 };

    const trigger = triggerRef?.current ?? el;

    const tween = scrub
      ? gsap.fromTo(el, fromVars, {
          ...toVars,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        })
      : gsap.fromTo(el, fromVars, {
          ...toVars,
          duration,
          ease,
          scrollTrigger: {
            trigger,
            start: scrollStart,
            // Play on enter; undo when scrolling back up past the start.
            toggleActions: "play none none reverse",
          },
        });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [
    from,
    distancePercent,
    scrollStart,
    scrollEnd,
    scrub,
    duration,
    ease,
    triggerRef,
  ]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`will-change-transform ${className}`}>
      {children}
    </Tag>
  );
}

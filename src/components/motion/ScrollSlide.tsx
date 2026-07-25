"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

type ScrollSlideProps = {
  children: ReactNode;
  className?: string;
  /** Entrance direction. */
  from: "left" | "right" | "up";
  /** Travel distance — % of element size (width for x, height for y). */
  distancePercent?: number;
  scrollStart?: string;
  scrollEnd?: string;
  as?: "span" | "div" | "p" | "h2" | "li";
};

/**
 * Scrubbed whole-block slide — diversifies from char-based ScrollFloat.
 */
export function ScrollSlide({
  children,
  className = "",
  from,
  distancePercent = 45,
  scrollStart = "top 85%",
  scrollEnd = "top 35%",
  as: Tag = "span",
}: ScrollSlideProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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

    const tween = gsap.fromTo(el, fromVars, {
      ...toVars,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: scrollStart,
        end: scrollEnd,
        scrub: true,
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [from, distancePercent, scrollStart, scrollEnd]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`will-change-transform ${className}`}>
      {children}
    </Tag>
  );
}

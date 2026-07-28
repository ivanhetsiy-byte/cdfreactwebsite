"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Exact bezier + viewBox exported from the Figma programs frame (node 2013:406). */
const GUIDE_D =
  "M1296.26 1.17C1296.26 1.17 775.693 414.485 731.262 791.17C662.618 1373.12 1712.26 1402.17 1724.76 1915.67C1737.26 2429.17 -78.7388 2515.17 4.26116 3457.17";

type ProgramsGuidePathProps = {
  /** When true, renders on mobile (used in the dedicated mobile programs layout). */
  showOnMobile?: boolean;
};

/**
 * Desktop guide line: draws itself with scroll (scrubbed stroke-dash) so the
 * tip travels the Figma curve as the programs box moves through the viewport.
 * Positioned over the scaled canvas in home-wireframes (2448:3456 region).
 */
export function ProgramsGuidePath({
  showOnMobile = false,
}: ProgramsGuidePathProps = {}) {
  const gradientId = showOnMobile
    ? "programs-guide-fade-mobile"
    : "programs-guide-fade";
  const visibilityClass = showOnMobile ? "block" : "hidden md:block";
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fadeStartRef = useRef<SVGStopElement>(null);
  const fadeEndRef = useRef<SVGStopElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const fadeStartStop = fadeStartRef.current;
    const fadeEndStop = fadeEndRef.current;
    const box = svg?.parentElement;
    if (!svg || !path || !box || !fadeStartStop || !fadeEndStop) return;

    const length = path.getTotalLength();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: reduced ? 0 : length,
    });
    if (reduced) return;

    const drawTween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: box,
        start: "top 65%",
        end: "bottom 75%",
        scrub: 0.85,
      },
    });

    // Tail fade: nearing the page bottom, slide a transparent stop up the
    // gradient so the line dissolves from its bottom end upward.
    const fade = { start: 1 };
    const applyFade = () => {
      fadeStartStop.setAttribute("offset", String(fade.start));
      fadeEndStop.setAttribute(
        "offset",
        String(Math.min(1, fade.start + 0.12)),
      );
    };
    const fadeTween = gsap.to(fade, {
      start: 0.5,
      ease: "none",
      onUpdate: applyFade,
      scrollTrigger: {
        trigger: box,
        start: "bottom 60%",
        end: "max",
        scrub: 0.85,
      },
    });

    return () => {
      drawTween.scrollTrigger?.kill();
      drawTween.kill();
      fadeTween.scrollTrigger?.kill();
      fadeTween.kill();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 2180.26 3457.3"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute top-0 left-[1.52%] h-full w-[89%] overflow-visible text-black dark:text-white ${visibilityClass}`}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="866.158"
          y1="1.17"
          x2="881.761"
          y2="3491.17"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.0528846" stopColor="currentColor" />
          <stop offset="0.947115" stopColor="currentColor" />
          <stop ref={fadeStartRef} offset="1" stopColor="currentColor" />
          <stop
            ref={fadeEndRef}
            offset="1"
            stopColor="currentColor"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={GUIDE_D}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3}
      />
    </svg>
  );
}

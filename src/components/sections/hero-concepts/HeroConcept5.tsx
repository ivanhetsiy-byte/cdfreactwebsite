"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { DancerCursorTrail } from "@/components/motion/DancerCursorTrail";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

/**
 * Concept 5 — Figma Minimal White + dancer cursor trail
 * Same corner-and-center hero as Concept 4, without Liquid Ether.
 * Pointer trail of dancer stills fades out behind the cursor.
 */
export function HeroConcept5() {
  const go = useDelayedNavigation();
  const rootRef = useRef<HTMLElement>(null);
  const seasonRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const season = seasonRef.current;
    const cta = ctaRef.current;

    const ctx = gsap.context(() => {
      if (season) gsap.set(season, { opacity: 0, y: 36 });
      if (cta) gsap.set(cta, { opacity: 0, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(season, { opacity: 1, y: 0, duration: 1.15, ease: "power4.out" }, 0.15)
        .to(cta, { opacity: 1, y: 0, duration: 0.7 }, 0.55);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-concept-5-heading"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-x-clip overflow-y-hidden bg-white px-6 text-black md:px-10"
    >
      <DancerCursorTrail containerRef={rootRef} />

      <h1 id="hero-concept-5-heading" className="sr-only">
        Childrens Dance Factory — Season 12
      </h1>

      <div className="relative z-10 flex w-full flex-col items-center md:contents">
        <p
          ref={seasonRef}
          aria-hidden="true"
          className="font-swiss font-light leading-none tracking-[-0.03em] whitespace-nowrap text-black md:relative md:z-10"
          style={{
            fontSize: "clamp(3rem, 18vw, 25.5rem)",
          }}
        >
          Season 12
        </p>

        <Link
          ref={ctaRef}
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            go("/contact");
          }}
          className="z-20 mt-[0.55em] inline-flex items-baseline gap-[0.35em] font-swiss text-[clamp(1.05rem,4.2vw,3.1875rem)] font-normal leading-none tracking-[-0.02em] text-black transition-opacity duration-300 hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black md:absolute md:right-10 md:bottom-14 md:mt-0"
        >
          <span className="leading-none">Train With Us</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 44 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[0.28em] w-[1.2em] shrink-0 self-baseline overflow-visible"
          >
            <path
              d="M1 5H41M41 5L34.5 1M41 5L34.5 9"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

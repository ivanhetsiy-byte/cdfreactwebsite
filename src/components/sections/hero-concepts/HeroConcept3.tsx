"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { LightRays } from "@/components/backgrounds/LightRays";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

/**
 * Concept 3 — Aperture
 * Experimental minimalist frame: type locked to the edges of a thin stage
 * aperture so the LightRays cone breathes through the empty center.
 */
export function HeroConcept3() {
  const go = useDelayedNavigation();
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const brandTopRef = useRef<HTMLParagraphElement>(null);
  const brandBottomRef = useRef<HTMLParagraphElement>(null);
  const twelveRef = useRef<HTMLParagraphElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const lineTopRef = useRef<HTMLSpanElement>(null);
  const lineRightRef = useRef<HTMLSpanElement>(null);
  const lineBottomRef = useRef<HTMLSpanElement>(null);
  const lineLeftRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const brandTop = brandTopRef.current;
      const brandBottom = brandBottomRef.current;
      const twelve = twelveRef.current;
      const live = liveRef.current;
      const support = supportRef.current;
      const cta = ctaRef.current;

      gsap.set(lineTopRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(lineRightRef.current, { scaleY: 0, transformOrigin: "center top" });
      gsap.set(lineBottomRef.current, { scaleX: 0, transformOrigin: "right center" });
      gsap.set(lineLeftRef.current, { scaleY: 0, transformOrigin: "center bottom" });

      if (brandTop) gsap.set(brandTop, { y: -20, opacity: 0 });
      if (brandBottom) gsap.set(brandBottom, { y: 20, opacity: 0 });
      if (twelve) gsap.set(twelve, { opacity: 0, x: 24 });
      if (live) gsap.set(live, { opacity: 0 });
      if (support) gsap.set(support, { opacity: 0 });
      if (cta) gsap.set(cta, { opacity: 0, y: 12 });

      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

      tl.to(lineTopRef.current, { scaleX: 1, duration: 0.7 }, 0.1)
        .to(lineRightRef.current, { scaleY: 1, duration: 0.7 }, 0.25)
        .to(lineBottomRef.current, { scaleX: 1, duration: 0.7 }, 0.4)
        .to(lineLeftRef.current, { scaleY: 1, duration: 0.7 }, 0.55)
        .to(brandTop, { y: 0, opacity: 1, duration: 0.75, ease: "power4.out" }, 0.65)
        .to(brandBottom, { y: 0, opacity: 1, duration: 0.75, ease: "power4.out" }, 0.78)
        .to(twelve, { opacity: 1, x: 0, duration: 0.7, ease: "power4.out" }, 0.9)
        .to(live, { opacity: 1, duration: 0.65, ease: "power4.out" }, 1.0)
        .to(support, { opacity: 1, duration: 0.6, ease: "power4.out" }, 1.1)
        .to(cta, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, 1.2);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-concept-3-heading"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-x-clip overflow-y-hidden bg-black px-4 py-24 text-white sm:px-6 md:px-10 md:py-28"
    >
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="bottom-center"
          raysColor="#ffffff"
          raysSpeed={0.8}
          lightSpread={0.8}
          fadeDistance={0.7}
          saturation={1.7}
          followMouse={false}
        />
      </div>

      <h1 id="hero-concept-3-heading" className="sr-only">
        Childrens Dance Factory — Season 12 now live
      </h1>

      {/* Stage aperture — architectural frame, not a content card */}
      <div
        ref={frameRef}
        className="relative z-10 h-[min(78dvh,42rem)] w-full max-w-[72rem]"
      >
        {/* Four hairline edges drawn independently */}
        <span
          ref={lineTopRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-px w-full bg-white/90"
        />
        <span
          ref={lineRightRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-full w-px bg-white/90"
        />
        <span
          ref={lineBottomRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-white/90"
        />
        <span
          ref={lineLeftRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-full w-px bg-white/90"
        />

        {/* Type locked to frame edges — empty center for the rays */}
        <p
          ref={brandTopRef}
          aria-hidden="true"
          className="absolute top-3 left-3 right-16 font-swiss font-bold leading-none tracking-[-0.055em] md:top-4 md:left-5 md:right-24"
          style={{ fontSize: "clamp(1.75rem, 4.8vw, 3.75rem)" }}
        >
          Childrens
        </p>

        <p
          ref={brandBottomRef}
          aria-hidden="true"
          className="absolute bottom-3 left-3 font-swiss font-bold leading-none tracking-[-0.055em] md:bottom-4 md:left-5"
          style={{ fontSize: "clamp(1.75rem, 4.8vw, 3.75rem)" }}
        >
          Dance Factory
        </p>

        <p
          ref={twelveRef}
          aria-hidden="true"
          className="absolute right-4 bottom-3 text-right font-swiss-compressed font-black leading-none tracking-[-0.08em] md:right-5 md:bottom-4"
          style={{ fontSize: "clamp(4rem, 14vw, 9rem)" }}
        >
          12
        </p>

        <p
          ref={liveRef}
          aria-hidden="true"
          className="absolute top-14 right-3 font-swiss text-[0.65rem] font-bold tracking-[0.45em] uppercase md:top-16 md:right-4"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          Now live
        </p>

        <p
          ref={supportRef}
          aria-hidden="true"
          className="absolute top-1/2 left-3 max-w-[11ch] -translate-y-1/2 font-swiss text-[0.75rem] font-light leading-[1.45] tracking-[-0.01em] text-white/70 md:left-5 md:text-[0.8125rem]"
        >
          Season twelve opens.
        </p>

        <div className="absolute right-3 bottom-[22%] md:right-5">
          <Link
            ref={ctaRef}
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              go("/contact");
            }}
            className="font-swiss inline-flex h-10 items-center justify-center border border-white bg-white px-4 text-[0.75rem] font-bold tracking-tight text-black transition-colors duration-700 ease-out hover:bg-transparent hover:text-white md:h-11 md:px-5 md:text-[0.8125rem]"
          >
            Train with Us
          </Link>
        </div>
      </div>
    </section>
  );
}

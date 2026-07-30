"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

gsap.registerPlugin(ScrollTrigger);

type AboutClosingCtaProps = {
  line: string;
  primary: string;
  secondary: string;
};

/**
 * Full-viewport dark closing panel.
 *
 * PageShell is now `variant="dark"` so there is no bottom or side padding to
 * escape; negative margins removed. The section fills the viewport naturally.
 *
 * Animation:
 * - Headline chars stagger up from below (SplitType + GSAP, same as hero)
 * - Brand-red rule sweeps in from the left after the headline settles
 * - CTA and secondary link fade up sequentially
 * - Ambient radial glow matches the hero aesthetic
 */
export function AboutClosingCta({
  line,
  primary,
  secondary,
}: AboutClosingCtaProps) {
  const go = useDelayedNavigation();

  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headlineEl = headlineRef.current;
    const ruleEl = ruleRef.current;
    const actionsEl = actionsRef.current;
    if (!section || !headlineEl || !actionsEl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set([headlineEl, actionsEl], { opacity: 1 });
      if (ruleEl) gsap.set(ruleEl, { scaleX: 1 });
      return;
    }

    const split = new SplitType(headlineEl, { types: "lines,chars" });
    split.lines?.forEach((l) => {
      (l as HTMLElement).style.overflow = "hidden";
      (l as HTMLElement).style.paddingBottom = "0.06em";
    });
    const chars = split.chars ?? [];

    gsap.set(chars, { yPercent: 110 });
    if (ruleEl) gsap.set(ruleEl, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(actionsEl, { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 72%",
        toggleActions: "play none none none",
      },
      defaults: { ease: "power4.out" },
    });

    tl.to(chars, { yPercent: 0, duration: 0.9, stagger: 0.018 });

    if (ruleEl) {
      tl.to(ruleEl, { scaleX: 1, duration: 0.55, ease: "power2.inOut" }, "-=0.48");
    }

    tl.to(actionsEl, { opacity: 1, y: 0, duration: 0.65 }, "-=0.28");

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      split.revert();
    };
  }, [line]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-cta-heading"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-black px-6 py-24 text-white md:px-10 md:py-[8vw]"
    >
      {/* Ambient radial glow — mirrors hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 72% 38%, rgba(195,23,22,0.06) 0%, transparent 52%)",
        }}
      />

      {/* Noise overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative flex flex-col gap-8 md:gap-10">
        <h2
          ref={headlineRef}
          id="about-cta-heading"
          className="font-swiss-compressed text-[clamp(4rem,18vw,14rem)] font-black uppercase leading-[0.88] tracking-tighter"
        >
          {line}
        </h2>

        {/* Brand-red sweep rule */}
        <span
          ref={ruleRef}
          aria-hidden="true"
          className="block h-px w-20 origin-left bg-brand-red"
        />

        <div
          ref={actionsRef}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <Link
            href="/classes"
            onClick={(e) => {
              e.preventDefault();
              go("/classes");
            }}
            className="inline-flex w-fit border-2 border-white bg-white px-10 py-4 font-swiss text-base font-bold tracking-widest text-black uppercase transition-colors duration-150 hover:bg-transparent hover:text-white md:text-lg"
          >
            {primary}
          </Link>
          <Link
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              go("/contact");
            }}
            className="inline-flex w-fit font-swiss text-[clamp(1rem,1.5vw,1.35rem)] font-bold uppercase tracking-tight text-white/35 transition-colors duration-150 hover:text-white"
          >
            {secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}

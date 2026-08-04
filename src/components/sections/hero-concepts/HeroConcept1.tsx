"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { LightRays } from "@/components/backgrounds/LightRays";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

/**
 * Concept 1 — Colliding Stage
 * Avant-garde asymmetry: fractured brand letters at colliding scales,
 * a massive season numeral interlocking the composition, vertical LIVE rail.
 */
export function HeroConcept1() {
  const go = useDelayedNavigation();
  const rootRef = useRef<HTMLElement>(null);
  const letterCRef = useRef<HTMLSpanElement>(null);
  const letterDRef = useRef<HTMLSpanElement>(null);
  const letterFRef = useRef<HTMLSpanElement>(null);
  const twelveRef = useRef<HTMLParagraphElement>(null);
  const seasonRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const letters = [letterCRef.current, letterDRef.current, letterFRef.current].filter(
        Boolean,
      );
      const twelve = twelveRef.current;
      const season = seasonRef.current;
      const sub = subRef.current;
      const live = liveRef.current;
      const cta = ctaRef.current;

      gsap.set(letters, { yPercent: 120, rotate: -8, opacity: 0 });
      if (twelve) gsap.set(twelve, { scale: 1.15, opacity: 0, filter: "blur(12px)" });
      if (season) gsap.set(season, { xPercent: -40, opacity: 0 });
      if (sub) gsap.set(sub, { y: 24, opacity: 0 });
      if (live) gsap.set(live, { opacity: 0 });
      if (cta) gsap.set(cta, { opacity: 0, x: -20 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(
        twelve,
        { scale: 1, opacity: 0.14, filter: "blur(0px)", duration: 1.4, ease: "power3.out" },
        0,
      )
        .to(
          letters,
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.05,
            stagger: { each: 0.12, from: "start" },
          },
          0.2,
        )
        .to(season, { xPercent: 0, opacity: 1, duration: 0.8 }, 0.45)
        .to(live, { opacity: 1, duration: 0.9 }, 0.55)
        .to(sub, { y: 0, opacity: 1, duration: 0.7 }, 0.75)
        .to(cta, { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" }, 0.9);

      letters.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: i % 2 === 0 ? -6 : 8,
          duration: 3.2 + i * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.6 + i * 0.15,
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-concept-1-heading"
      className="relative min-h-dvh w-full overflow-x-clip overflow-y-hidden bg-black text-white"
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

      <h1 id="hero-concept-1-heading" className="sr-only">
        Childrens Dance Factory — Season 12 now live
      </h1>

      <p
        ref={twelveRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-[42%] left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 select-none font-swiss-compressed font-black leading-none tracking-[-0.08em] text-white md:top-[46%]"
        style={{ fontSize: "clamp(14rem, 52vw, 48rem)" }}
      >
        12
      </p>

      <p
        ref={liveRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-[22%] right-4 z-10 font-swiss text-[0.65rem] font-bold tracking-[0.5em] uppercase md:top-1/2 md:right-6 lg:right-10"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        Live
        <span className="mt-[0.6em] inline-block h-[0.55em] w-[2px] bg-white motion-safe:animate-[caret-blink_1.1s_linear_infinite]" />
      </p>

      <p
        ref={seasonRef}
        aria-hidden="true"
        className="absolute top-28 left-6 z-10 font-swiss text-[0.65rem] font-bold tracking-[0.42em] uppercase md:top-36 md:left-10 md:text-[0.7rem]"
      >
        Season
      </p>

      <div className="absolute inset-0 z-10" aria-hidden="true">
        <span
          ref={letterCRef}
          className="absolute top-[18%] left-[4%] font-swiss font-bold leading-none tracking-[-0.07em] md:left-[6%]"
          style={{ fontSize: "clamp(5.5rem, 18vw, 14rem)" }}
        >
          C
        </span>
        <span
          ref={letterDRef}
          className="absolute top-[38%] left-[28%] font-swiss font-bold italic leading-none tracking-[-0.08em] md:left-[32%]"
          style={{ fontSize: "clamp(7rem, 24vw, 20rem)" }}
        >
          D
        </span>
        <span
          ref={letterFRef}
          className="absolute top-[52%] right-[8%] font-swiss font-bold leading-none tracking-[-0.07em] md:right-[12%]"
          style={{ fontSize: "clamp(5rem, 16vw, 13rem)" }}
        >
          F
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-6 pb-10 md:px-10 md:pb-14">
        <p
          ref={subRef}
          aria-hidden="true"
          className="max-w-[14ch] font-swiss text-[0.8125rem] font-light leading-[1.35] tracking-[-0.01em] text-white/80 md:max-w-[18ch] md:text-[0.9375rem]"
        >
          Childrens Dance Factory —
          <span className="mt-1 block origin-bottom-left font-normal [transform:skewX(-8deg)]">
            now live
          </span>
        </p>

        <Link
          ref={ctaRef}
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            go("/contact");
          }}
          className="font-swiss group relative inline-flex h-12 shrink-0 items-center justify-center overflow-hidden border border-white bg-transparent px-6 text-[0.8125rem] font-bold tracking-tight text-white md:h-14 md:px-8 md:text-[0.9375rem]"
        >
          <span className="relative z-10 transition-colors duration-500 group-hover:text-black">
            Train with Us
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100"
          />
        </Link>
      </div>
    </section>
  );
}

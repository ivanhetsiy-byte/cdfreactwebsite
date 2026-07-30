"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { NarrativeReveal } from "@/components/motion/NarrativeReveal";

gsap.registerPlugin(ScrollTrigger);

type AboutMissionProps = {
  lead: string;
  p1: string;
  p2: string;
};

/**
 * Cinematic text-only statement section.
 *
 * Desktop (md+):
 *   The panel pins for 220vh of scroll travel. As the user moves through that
 *   distance, three passages illuminate word-by-word with a Y-offset scrub via
 *   `NarrativeReveal`. A thin brand-red accent rule and eyebrow fade in on pin
 *   start.
 *
 * Mobile:
 *   Pin is disabled. Each passage reveals via threshold-enter scroll trigger.
 *
 * Image column from the previous design has been intentionally removed to
 * achieve the pure-typographic lml.cc-style focus.
 */
export function AboutMission({ lead, p1, p2 }: AboutMissionProps) {
  const outerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const panel = panelRef.current;
    const eyebrow = eyebrowRef.current;
    const rule = ruleRef.current;
    if (!outer || !panel) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      if (eyebrow) gsap.set(eyebrow, { opacity: 1 });
      if (rule) gsap.set(rule, { scaleX: 1 });
      return;
    }

    if (eyebrow) gsap.set(eyebrow, { opacity: 0 });
    if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });

    const SCROLL_EXTRA = window.innerHeight * 2.2;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const pinTrigger = ScrollTrigger.create({
        trigger: panel,
        start: "top top+=80",
        end: `+=${SCROLL_EXTRA}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      // Eyebrow + rule sweep on pin-enter
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top top+=80",
          toggleActions: "play none none reverse",
        },
      });
      if (eyebrow) enterTl.to(eyebrow, { opacity: 1, duration: 0.7, ease: "power2.out" });
      if (rule) {
        enterTl.to(
          rule,
          { scaleX: 1, duration: 0.55, ease: "power2.inOut" },
          eyebrow ? "-=0.35" : 0,
        );
      }

      return () => {
        pinTrigger.kill();
        enterTl.scrollTrigger?.kill();
        enterTl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      const tween = gsap.timeline({
        scrollTrigger: {
          trigger: outer,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
      if (eyebrow) tween.to(eyebrow, { opacity: 1, duration: 0.6, ease: "power2.out" });
      if (rule) {
        tween.to(
          rule,
          { scaleX: 1, duration: 0.5, ease: "power2.inOut" },
          eyebrow ? "-=0.3" : 0,
        );
      }
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={outerRef}
      aria-label="Studio story"
      className="relative w-full"
    >
      <div
        ref={panelRef}
        className="relative flex min-h-svh flex-col justify-center gap-10 py-20 md:gap-12 md:py-0"
      >
        {/* Eyebrow */}
        <p
          ref={eyebrowRef}
          className="font-swiss text-xs font-medium tracking-[0.28em] text-white/30 uppercase md:text-sm"
        >
          Our Story
        </p>

        {/* Brand-red accent sweep */}
        <span
          ref={ruleRef}
          aria-hidden="true"
          className="block h-px w-16 origin-left bg-brand-red"
        />

        {/* Lead — large scrub reveal */}
        <NarrativeReveal
          text={lead}
          triggerRef={outerRef}
          scrubStart="top top+=80"
          scrubEnd="38% bottom"
          className="font-alt text-[clamp(1.4rem,2.8vw,2.5rem)] leading-[1.35] tracking-tight text-white"
        />

        {/* Supporting paragraph 1 */}
        <NarrativeReveal
          text={p1}
          triggerRef={outerRef}
          scrubStart="30% bottom"
          scrubEnd="62% bottom"
          className="max-w-2xl font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.62] tracking-tight text-white/45"
        />

        {/* Supporting paragraph 2 */}
        <NarrativeReveal
          text={p2}
          triggerRef={outerRef}
          scrubStart="58% bottom"
          scrubEnd="88% bottom"
          className="max-w-2xl font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.62] tracking-tight text-white/45"
        />
      </div>
    </section>
  );
}

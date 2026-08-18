"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

import { Shuffle } from "@/components/motion/Shuffle";
import { scheduleScrollTriggerRefresh } from "@/lib/gsap-refresh";

gsap.registerPlugin(ScrollTrigger);

const YEAR = "2015";
const LEAD = "Founded In";

/**
 * Founding-year statement.
 *
 * The lead line uses the same reveal as the "Where We've Been" heading:
 * characters rise out of a mask on a power4.out curve, self-running rather than
 * scrubbed so the motion stays smooth regardless of scroll speed. The year then
 * lands digit by digit via Shuffle, each digit rolling past random numerals
 * before settling. The section is a normal full-viewport beat — no pin dwell.
 */
export function AboutFounded() {
  const sectionRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const lead = leadRef.current;
    if (!section || !lead) return;

    const split = new SplitType(lead, {
      types: "chars",
      tagName: "span",
      charClass: "char inline-block",
    });
    const chars = split.chars ?? [];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !chars.length) {
      gsap.set(chars, { opacity: 1, yPercent: 0 });
      return () => split.revert();
    }

    const ctx = gsap.context(() => {
      gsap.set(chars, {
        opacity: 0,
        yPercent: 110,
        willChange: "opacity, transform",
      });

      const reveal = gsap.to(chars, {
        opacity: 1,
        yPercent: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.03,
        paused: true,
        // Drop the residual transform so layout and paint agree once settled
        onComplete: () => gsap.set(chars, { clearProps: "transform,willChange" }),
      });

      ScrollTrigger.create({
        trigger: lead,
        start: "top 92%",
        onEnter: () => reveal.play(),
        onLeaveBack: () => {
          // Reversing SplitType on every up-swipe is a mobile hitch.
          if (window.matchMedia("(max-width: 767px)").matches) return;
          reveal.reverse();
        },
      });
    }, section);

    scheduleScrollTriggerRefresh();

    return () => {
      ctx.revert();
      split.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label={`${LEAD} ${YEAR}`}
      className="relative flex h-svh w-full items-center overflow-hidden bg-white"
    >
      <div className="w-full px-6 md:px-10">
        <h2 className="font-swiss font-normal text-black">
          <span className="sr-only">{`${LEAD} ${YEAR}`}</span>
          <span aria-hidden className="block">
            {/* Mask clips the rising glyphs to the line */}
            <span className="block overflow-hidden">
              <span
                ref={leadRef}
                className="block text-[min(13vw,14vh)] leading-none tracking-tight md:text-[min(10vw,16vh)]"
              >
                {LEAD}
              </span>
            </span>
            {/* No mask here — Shuffle clips each digit to its own strip */}
            <span className="block text-center">
              <Shuffle
                text={YEAR}
                className="inline-block text-[min(28vw,30vh)] leading-none tracking-tight tabular-nums md:text-[min(22vw,36vh)]"
                shuffleDirection="up"
                duration={0.5}
                stagger={0.08}
                shuffleTimes={3}
                scrambleCharset="0123456789"
                // Late enough that the whole year clears the fold before it rolls
                threshold={0.42}
                rootMargin="0px"
              />
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}

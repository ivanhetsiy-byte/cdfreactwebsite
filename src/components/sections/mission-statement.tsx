"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MISSION_LOCKED_TITLE } from "@/context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const WORDS = [
  {
    text: MISSION_LOCKED_TITLE.where,
    offsetClass: "self-start ml-[3.9%] max-md:ml-4",
    /** Slide in from the right */
    fromXPercent: 70,
  },
  {
    text: MISSION_LOCKED_TITLE.talent,
    // Tight cascade: Figma tops ~0.92em apart → −0.08em overlap
    offsetClass: "self-start ml-[49.6%] -mt-[0.08em] max-md:ml-[18%]",
    /** Slide in from the left */
    fromXPercent: -70,
  },
  {
    text: MISSION_LOCKED_TITLE.grows,
    offsetClass: "self-start ml-[24.5%] -mt-[0.08em] max-md:ml-[8%]",
    /** Slide in from the right */
    fromXPercent: 70,
  },
] as const;

const WORD_CLASS =
  "font-swiss font-normal leading-none tracking-tight whitespace-nowrap text-[clamp(4.5rem,17.6vw,28rem)]";

/**
 * Editorial “Where / Talent / Grows” — Figma-style staggered stack.
 * Talent scrub-slides from the left; Where and Grows from the right.
 */
export function MissionStatement() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const words = section.querySelectorAll<HTMLElement>("[data-mission-word]");
    if (!words.length) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
          };

          const scrub = isDesktop ? 0.55 : 0.35;

          words.forEach((word, index) => {
            const fromXPercent = WORDS[index]?.fromXPercent ?? -70;

            gsap.fromTo(
              word,
              { xPercent: fromXPercent, opacity: 0 },
              {
                xPercent: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: word,
                  start: "top 90%",
                  end: "top 45%",
                  scrub,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        },
      );
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="mission-section"
      aria-labelledby="mission-heading"
      className="relative w-full overflow-x-hidden bg-white text-black dark:bg-black dark:text-white"
    >
      <h2 id="mission-heading" className="sr-only">
        {MISSION_LOCKED_TITLE.full}
      </h2>

      <div className="flex flex-col gap-0 pt-[clamp(5rem,16vh,12rem)] pb-[clamp(6rem,20vh,14rem)]">
        {WORDS.map(({ text, offsetClass }) => (
          <p
            key={text}
            data-mission-word
            aria-hidden="true"
            className={`${WORD_CLASS} ${offsetClass} opacity-0 will-change-transform motion-reduce:translate-x-0 motion-reduce:opacity-100`}
          >
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}

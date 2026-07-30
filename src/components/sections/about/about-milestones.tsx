"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { NarrativeReveal } from "@/components/motion/NarrativeReveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

gsap.registerPlugin(ScrollTrigger);

export type AboutMilestone = {
  year: string;
  title: string;
  body: string;
};

export type AboutStat = {
  value: string;
  label: string;
  /** Numeric target for count-up */
  numeric: number;
  suffix?: string;
};

type AboutMilestonesProps = {
  eyebrow: string;
  heading: string;
  items: readonly AboutMilestone[];
  stats: readonly AboutStat[];
};

/**
 * Vertical year-journey timeline.
 *
 * Previous horizontal scrub replaced with a cleaner vertical narrative:
 * - Each milestone occupies ~75vh with a thin left spine and a timeline dot
 * - The year is displayed as a massive watermark behind each entry
 * - Milestone titles use `SplitReveal` on scroll-enter
 * - Bodies use `NarrativeReveal` in threshold mode
 * - Stats count-up retained at the section bottom
 */
export function AboutMilestones({
  eyebrow,
  heading,
  items,
  stats,
}: AboutMilestonesProps) {
  const statsRef = useRef<HTMLDListElement>(null);
  const statValueRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const statsEl = statsRef.current;
    if (!statsEl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const values = statValueRefs.current.filter(Boolean) as HTMLElement[];

    if (reduced) {
      values.forEach((el, i) => {
        const stat = stats[i];
        if (stat) el.textContent = `${stat.numeric}${stat.suffix ?? ""}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      values.forEach((el, i) => {
        const stat = stats[i];
        if (!stat) return;
        const counter = { n: 0 };
        gsap.to(counter, {
          n: stat.numeric,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsEl,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.n)}${stat.suffix ?? ""}`;
          },
        });
      });
    }, statsEl);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [stats]);

  return (
    <section
      aria-labelledby="about-milestones-heading"
      className="relative w-full pb-28 md:pb-[10vw]"
    >
      {/* Section header */}
      <div className="mb-16 md:mb-[5vw]">
        <p className="mb-3 font-swiss text-xs font-medium tracking-[0.28em] text-white/30 uppercase md:text-sm">
          {eyebrow}
        </p>
        <SplitReveal
          text={heading}
          as="h2"
          id="about-milestones-heading"
          splitBy="words"
          stagger={0.08}
          onScroll
          scrollStart="top 85%"
          className="font-swiss text-[clamp(2.25rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tighter text-white"
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical spine — desktop */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 hidden h-full w-px bg-white/8 md:block"
        />

        <div className="flex flex-col gap-0">
          {items.map((item, index) => (
            <article
              key={item.year}
              aria-label={item.title}
              className="relative flex min-h-[72vh] flex-col justify-center border-t border-white/8 py-16 md:pl-14 md:py-20"
            >
              {/* Year watermark — right-aligned, barely visible */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none font-swiss-compressed text-[clamp(5rem,17vw,15rem)] font-black leading-none tracking-tighter text-white/[0.032]"
              >
                {item.year}
              </span>

              {/* Timeline dot — desktop */}
              <span
                aria-hidden="true"
                className="absolute -left-[4.5px] top-16 hidden h-[9px] w-[9px] rounded-full bg-brand-red md:block"
              />

              {/* Content */}
              <div className="relative max-w-2xl">
                {/* Year label */}
                <span
                  aria-hidden="true"
                  className="mb-5 block font-swiss-compressed text-[clamp(0.7rem,1.1vw,0.875rem)] font-black tracking-[0.25em] text-brand-red uppercase"
                >
                  {item.year}
                </span>

                <SplitReveal
                  text={item.title}
                  as="h3"
                  splitBy="words"
                  stagger={0.07}
                  onScroll
                  scrollStart="top 83%"
                  className="mb-6 font-swiss text-[clamp(2rem,4.5vw,3.75rem)] font-black uppercase leading-[0.92] tracking-tighter text-white"
                />

                <NarrativeReveal
                  text={item.body}
                  threshold
                  thresholdStart="top 80%"
                  className="font-alt text-[clamp(1rem,1.3vw,1.2rem)] leading-[1.62] tracking-tight text-white/40"
                />
              </div>

              {/* Ghost index — mobile only */}
              <span
                aria-hidden="true"
                className="mt-auto pt-8 font-swiss-compressed text-[clamp(4rem,12vw,8rem)] font-black leading-none tracking-tighter text-white/[0.04] md:hidden"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </article>
          ))}
        </div>
      </div>

      {/* Stats */}
      <dl
        ref={statsRef}
        aria-label="CDF in numbers"
        className="mt-20 grid grid-cols-1 gap-12 border-t border-white/8 pt-12 md:mt-[6vw] md:grid-cols-3 md:gap-8 md:pt-[3.5vw]"
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex flex-col gap-3">
            <dd
              ref={(el) => {
                statValueRefs.current[index] = el;
              }}
              className="order-1 font-swiss text-[clamp(4.5rem,12vw,7rem)] font-black leading-[0.85] tracking-tighter text-white"
            >
              {stat.value}
            </dd>
            <dt className="order-2 font-swiss text-xs font-medium tracking-[0.24em] text-white/30 uppercase md:text-sm">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

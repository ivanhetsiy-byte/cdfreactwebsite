"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PinnedChapter } from "@/components/motion/PinnedChapter";

gsap.registerPlugin(ScrollTrigger);

export type AboutValue = {
  title: string;
  body: string;
};

type AboutValuesProps = {
  eyebrow: string;
  heading: string;
  items: readonly AboutValue[];
};

/**
 * Four sequential full-viewport value chapters with cinematic dark styling.
 *
 * Desktop (md+):
 *   A single ScrollTrigger pins the panel for (CHAPTERS − 1) × 100vh. A
 *   scrubbed GSAP timeline cross-fades each `PinnedChapter` in and out.
 *   `activeChapter` state drives the progress-dot highlight inside each
 *   `PinnedChapter`. A brand-red progress bar sweeps along the bottom.
 *
 * Mobile:
 *   Pin is skipped. Each chapter stacks vertically and reveals via threshold.
 */
export function AboutValues({ eyebrow, heading, items }: AboutValuesProps) {
  const outerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const panel = panelRef.current;
    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    const progress = progressRef.current;
    if (!outer || !panel || !slides.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CHAPTERS = items.length;

    if (reduced) {
      gsap.set(slides, { opacity: 1, yPercent: 0 });
      return;
    }

    const SCROLL_EXTRA = window.innerHeight * (CHAPTERS - 1);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // All slides invisible except first
      gsap.set(slides, { opacity: 0, yPercent: 18 });
      if (slides[0]) gsap.set(slides[0], { opacity: 1, yPercent: 0 });
      setActiveChapter(0);

      const pinTrigger = ScrollTrigger.create({
        trigger: panel,
        start: "top top+=80",
        end: `+=${SCROLL_EXTRA}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top top+=80",
          end: `+=${SCROLL_EXTRA}`,
          scrub: 1.2,
          onUpdate: (self) => {
            const chapter = Math.min(CHAPTERS - 1, Math.floor(self.progress * CHAPTERS));
            setActiveChapter((prev) => (prev !== chapter ? chapter : prev));
          },
        },
      });

      const segment = 1 / (CHAPTERS - 1);

      slides.forEach((slide, i) => {
        if (i === 0) {
          tl.to(slide, { opacity: 0, yPercent: -12, ease: "none" }, segment * 0.65);
        } else if (i < CHAPTERS - 1) {
          const inStart = segment * (i - 1) + segment * 0.6;
          const outStart = segment * i + segment * 0.65;
          tl.fromTo(
            slide,
            { opacity: 0, yPercent: 18 },
            { opacity: 1, yPercent: 0, ease: "none" },
            inStart,
          );
          tl.to(slide, { opacity: 0, yPercent: -12, ease: "none" }, outStart);
        } else {
          const inStart = segment * (i - 1) + segment * 0.6;
          tl.fromTo(
            slide,
            { opacity: 0, yPercent: 18 },
            { opacity: 1, yPercent: 0, ease: "none" },
            inStart,
          );
        }
      });

      if (progress) {
        gsap.fromTo(
          progress,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top top+=80",
              end: `+=${SCROLL_EXTRA}`,
              scrub: true,
            },
          },
        );
      }

      return () => {
        pinTrigger.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set(slides, { opacity: 0, yPercent: 20 });

      const tweens = slides.map((slide) =>
        gsap.to(slide, {
          opacity: 1,
          yPercent: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: slide,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }),
      );

      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      };
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
    };
  }, [items.length]);

  return (
    <section
      ref={outerRef}
      aria-labelledby="about-values-heading"
      className="relative w-full"
    >
      {/* Screen-reader label */}
      <h2 id="about-values-heading" className="sr-only">
        {heading}
      </h2>

      <div
        ref={panelRef}
        className="relative flex min-h-svh flex-col md:overflow-hidden"
      >
        {/* Mobile visible label (decorative — sr-only heading above is a11y anchor) */}
        <div aria-hidden="true" className="mb-10 flex flex-col gap-3 md:hidden">
          <p className="type-eyebrow text-xs font-medium text-white/30">
            {eyebrow}
          </p>
          <p className="font-swiss text-[clamp(2.25rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tighter text-white">
            {heading}
          </p>
        </div>

        {/* Slide deck — desktop: absolutely stacked; mobile: flowing stack */}
        <div className="relative flex-1 md:absolute md:inset-0">
          {items.map((item, index) => (
            <div
              key={item.title}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="flex min-h-[70vh] flex-col justify-center py-16 md:absolute md:inset-0 md:min-h-0 md:py-0"
            >
              <PinnedChapter
                index={index}
                total={items.length}
                activeIndex={activeChapter}
                eyebrow={eyebrow}
              >
                {/* Brand-red left accent + numeral + title */}
                <div className="mb-8 flex items-start gap-5 md:gap-7">
                  <span
                    aria-hidden="true"
                    className="mt-1 hidden h-14 w-[3px] shrink-0 bg-brand-red md:block"
                  />

                  <div className="flex flex-col gap-3">
                    <span
                      aria-hidden="true"
                      className="font-swiss text-xs font-medium tracking-[0.3em] text-brand-red uppercase md:text-sm"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="font-swiss text-[clamp(3.5rem,10vw,8.5rem)] font-black uppercase leading-[0.88] tracking-tighter text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Body text */}
                <p className="max-w-2xl font-alt text-[clamp(1rem,1.5vw,1.375rem)] leading-[1.62] tracking-tight text-white/40 md:max-w-[52rem]">
                  {item.body}
                </p>
              </PinnedChapter>
            </div>
          ))}
        </div>

        {/* Brand-red progress bar — desktop only, anchored to bottom of pin */}
        <div
          aria-hidden="true"
          className="hidden h-px w-full bg-white/8 md:block"
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        >
          <span
            ref={progressRef}
            className="absolute inset-y-0 left-0 w-full origin-left bg-brand-red"
          />
        </div>
      </div>

      {/* Mobile bottom divider */}
      <div aria-hidden="true" className="mt-10 h-px w-full bg-white/8 md:hidden" />
    </section>
  );
}

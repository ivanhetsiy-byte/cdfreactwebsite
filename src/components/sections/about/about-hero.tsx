"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MOTION_MQ } from "@/lib/motion-env";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned horizontal-scrub hero.
 *
 * On load the oversized single-line title sits at x=0 and is clipped on the
 * right. Vertical scroll pins the section and drives x negative until the
 * trailing edge of the line is fully visible, then releases into the page.
 *
 * The title rewinds to x=0 once the section is fully above the fold, so the
 * reset is never visible. Scrolling back up snaps to the pin start, skipping
 * the reverse horizontal scrub.
 *
 * Vertical centering uses flex so GSAP can own the `x` transform without
 * fighting a CSS `translateY`.
 *
 * Mobile never uses GSAP pin/scrub (iOS JS scroll events are too sparse, so
 * scrub reads as frame-by-frame). A CSS view timeline on the sticky runway
 * pans the title on the compositor instead.
 */
export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const runway = runwayRef.current;
    const text = textRef.current;
    if (!section || !runway || !text) return;

    const reduced = window.matchMedia(MOTION_MQ.reduced).matches;
    if (reduced) {
      setReducedMotion(true);
      return;
    }

    const getDistance = () =>
      Math.max(0, text.scrollWidth - window.innerWidth);

    const rewindTitle = (self?: ScrollTrigger) => {
      // Land the scrub on its current target rather than killing it —
      // ScrollTrigger reuses that one tween for every later update.
      self?.getTween()?.progress(1);
      self?.animation?.progress(0);
      gsap.set(text, { x: 0 });
    };

    const scrollToPinStart = (start: number) => {
      const lenis = (
        window as unknown as {
          lenis?: { scrollTo: (y: number, opts?: { immediate?: boolean }) => void };
        }
      ).lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(start, { immediate: true });
      } else {
        window.scrollTo(0, start);
      }
    };

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tween = gsap.to(text, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onEnterBack: (self) => {
            scrollToPinStart(self.start);
            rewindTitle(self);
          },
        },
      });

      const exitObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry || entry.isIntersecting) return;
          if (entry.boundingClientRect.bottom > 0) return;
          rewindTitle(tween.scrollTrigger);
        },
        { threshold: 0 },
      );
      exitObserver.observe(section);

      return () => {
        exitObserver.disconnect();
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      const applyTravel = () => {
        const d = getDistance();
        runway.style.height = `calc(100svh + ${d}px)`;
        runway.style.setProperty("--cdf-hero-travel", `${d}px`);
        return d;
      };
      applyTravel();

      const fonts = document.fonts;
      if (fonts?.ready) {
        void fonts.ready.then(() => applyTravel());
      }

      return () => {
        runway.style.height = "";
        runway.style.removeProperty("--cdf-hero-travel");
      };
    });

    const fonts = document.fonts;
    if (fonts?.ready) {
      void fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="cdf-about-hero relative w-full bg-white max-md:touch-pan-y md:overflow-x-clip"
    >
      <div ref={runwayRef} className="cdf-about-hero-runway relative h-svh">
        <div className="flex h-svh w-full items-center overflow-hidden max-md:sticky max-md:top-0">
          <h1
            id="about-heading"
            ref={textRef}
            className={
              reducedMotion
                ? "px-6 font-swiss font-normal leading-none tracking-tight text-black text-[clamp(2.5rem,12vw,6rem)]"
                : "cdf-about-hero-title whitespace-nowrap font-swiss font-normal leading-none tracking-tight text-black text-[16vw] will-change-transform"
            }
          >
            Childrens Dance Factory
          </h1>
        </div>
      </div>
    </section>
  );
}

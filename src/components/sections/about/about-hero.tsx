"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
 */
export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    if (!section || !text) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    const tween = gsap.to(text, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getDistance()}`,
        pin: true,
        // Matches the section below so the scroll feel carries across the pin
        // handoff instead of switching from instant to smoothed tracking.
        scrub: 0.6,
        invalidateOnRefresh: true,
        // Skip the reverse horizontal scrub — jump to the top of the pin and
        // land there in the same callback, before the frame paints.
        onEnterBack: (self) => {
          scrollToPinStart(self.start);
          rewindTitle(self);
        },
      },
    });

    // Rewind only once the hero is fully above the fold. Doing it at pin
    // release would snap the title back while the section still fills the
    // screen, which reads as a stutter handing off to the section below.
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
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="relative flex h-svh w-full items-center overflow-hidden bg-white"
    >
      <h1
        id="about-heading"
        ref={textRef}
        className={
          reducedMotion
            ? "px-6 font-swiss font-normal leading-none tracking-tight text-black text-[clamp(2.5rem,12vw,6rem)]"
            : "whitespace-nowrap font-swiss font-normal leading-none tracking-tight text-black text-[16vw] will-change-transform"
        }
      >
        Childrens Dance Factory
      </h1>
    </section>
  );
}

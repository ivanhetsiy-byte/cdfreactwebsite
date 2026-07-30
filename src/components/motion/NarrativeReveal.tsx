"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

type NarrativeRevealProps = {
  text: string;
  /** Split by words (default) or lines */
  splitBy?: "words" | "lines";
  /**
   * Ref to the outer (tall) container that defines the scroll travel distance.
   * Falls back to the element itself when omitted.
   */
  triggerRef?: RefObject<HTMLElement | null>;
  /** ScrollTrigger start string — scrub mode only */
  scrubStart?: string;
  /** ScrollTrigger end string — scrub mode only */
  scrubEnd?: string;
  /** When true, fires once on scroll-enter instead of scrubbing */
  threshold?: boolean;
  /** ScrollTrigger start — threshold mode only */
  thresholdStart?: string;
  as?: "p" | "div" | "span" | "h2" | "h3" | "h4";
  className?: string;
};

/**
 * Scroll-driven text reveal.
 *
 * Each word/line begins at `opacity: 0.08, yPercent: 12` and animates to
 * `opacity: 1, yPercent: 0` — either scrubbed to a scroll range or fired
 * once on threshold-enter.
 *
 * Upgrade over `ScrubText`: adds a Y-axis offset for spatial depth and
 * supports both scrub and threshold modes with the same component.
 */
export function NarrativeReveal({
  text,
  splitBy = "words",
  triggerRef,
  scrubStart = "top top+=80",
  scrubEnd = "75% bottom",
  threshold = false,
  thresholdStart = "top 80%",
  as: Tag = "p",
  className = "",
}: NarrativeRevealProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    const triggerEl = triggerRef?.current ?? el;
    if (!el || !triggerEl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const split = new SplitType(el, {
      types: splitBy === "lines" ? "lines" : "words",
    });

    const targets = splitBy === "lines" ? split.lines : split.words;

    if (!targets?.length) {
      split.revert();
      return;
    }

    if (reduced) {
      gsap.set(targets, { opacity: 1, yPercent: 0 });
      return () => {
        split.revert();
      };
    }

    gsap.set(targets, { opacity: 0.08, yPercent: 12 });

    let tween: gsap.core.Tween;

    if (threshold) {
      tween = gsap.to(targets, {
        opacity: 1,
        yPercent: 0,
        duration: 0.72,
        ease: "power3.out",
        stagger: { each: 0.065, from: "start" },
        scrollTrigger: {
          trigger: el,
          start: thresholdStart,
          toggleActions: "play none none none",
        },
      });
    } else {
      tween = gsap.to(targets, {
        opacity: 1,
        yPercent: 0,
        ease: "none",
        stagger: { each: 1 / targets.length, from: "start" },
        scrollTrigger: {
          trigger: triggerEl,
          start: scrubStart,
          end: scrubEnd,
          scrub: 1.4,
        },
      });
    }

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [text, splitBy, scrubStart, scrubEnd, threshold, thresholdStart, triggerRef]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
    >
      {text}
    </Tag>
  );
}

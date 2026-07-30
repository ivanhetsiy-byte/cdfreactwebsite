"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

type ScrubTextProps = {
  text: string;
  /**
   * Ref to the outer (tall) container that defines the scroll travel distance.
   * The words' opacity is mapped across the scroll range of this element.
   */
  triggerRef: RefObject<HTMLElement | null>;
  /** ScrollTrigger start string, e.g. "top top+=80" */
  scrubStart?: string;
  /** ScrollTrigger end string, e.g. "80% bottom" */
  scrubEnd?: string;
  className?: string;
};

/**
 * Renders a paragraph whose words illuminate progressively as the user
 * scrolls through the `triggerRef` element.
 *
 * Words begin at low opacity (0.12) and animate to full opacity (1) in
 * sequence, tied directly to scroll position via GSAP scrub.
 */
export function ScrubText({
  text,
  triggerRef,
  scrubStart = "top top+=80",
  scrubEnd = "75% bottom",
  className = "",
}: ScrubTextProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    const triggerEl = triggerRef.current;
    if (!el || !triggerEl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const split = new SplitType(el, { types: "words" });
    const words = split.words;

    if (!words?.length) {
      split.revert();
      return;
    }

    if (reduced) {
      gsap.set(words, { opacity: 1 });
      return () => {
        split.revert();
      };
    }

    gsap.set(words, { opacity: 0.12 });

    const tween = gsap.to(words, {
      opacity: 1,
      ease: "none",
      stagger: {
        each: 1 / words.length,
        from: "start",
      },
      scrollTrigger: {
        trigger: triggerEl,
        start: scrubStart,
        end: scrubEnd,
        scrub: 1.4,
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [text, triggerRef, scrubStart, scrubEnd]);

  return (
    <p ref={ref} className={className}>
      {text}
    </p>
  );
}

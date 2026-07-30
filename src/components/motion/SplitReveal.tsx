"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

type SplitRevealProps = {
  text: string;
  as?: HeadingTag;
  /** Split into individual characters or whole words. */
  splitBy?: "chars" | "words";
  stagger?: number;
  /** Initial delay before the animation starts (seconds). */
  delay?: number;
  /** When true the reveal fires on scroll-enter; when false it fires on mount. */
  onScroll?: boolean;
  scrollStart?: string;
  className?: string;
  id?: string;
};

/**
 * Renders `text` inside the given tag, then on mount (or scroll-enter) staggers
 * each char/word up from below its baseline using SplitType + GSAP.
 *
 * Lines are automatically wrapped with overflow:hidden so the initial
 * out-of-view characters do not create layout overflow.
 */
export function SplitReveal({
  text,
  as: Tag = "div",
  splitBy = "chars",
  stagger = 0.025,
  delay = 0,
  onScroll = false,
  scrollStart = "top 82%",
  className = "",
  id,
}: SplitRevealProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Always split so the DOM is correct, then decide animation path.
    const split = new SplitType(el, {
      types: splitBy === "chars" ? "lines,chars" : "lines,words",
    });

    // Clip each line so chars flying in from below don't bleed outside.
    split.lines?.forEach((line) => {
      (line as HTMLElement).style.overflow = "hidden";
      (line as HTMLElement).style.paddingBottom = "0.08em"; // prevent descender clip
    });

    const targets = splitBy === "chars" ? split.chars : split.words;

    if (!targets?.length) {
      split.revert();
      return;
    }

    if (reduced) {
      gsap.set(targets, { yPercent: 0, opacity: 1 });
      return () => {
        split.revert();
      };
    }

    gsap.set(targets, { yPercent: 108 });

    const triggerConfig = onScroll
      ? {
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            toggleActions: "play none none none",
          },
        }
      : {};

    const tween = gsap.to(targets, {
      yPercent: 0,
      stagger,
      delay,
      duration: 0.88,
      ease: "power4.out",
      ...triggerConfig,
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [text, splitBy, stagger, delay, onScroll, scrollStart]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      id={id}
    >
      {text}
    </Tag>
  );
}

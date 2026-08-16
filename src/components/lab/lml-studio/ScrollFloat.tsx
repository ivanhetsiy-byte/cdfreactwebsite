"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import SplitType from "split-type";

import { prefersReducedMotion } from "@/lib/motion-env";

gsap.registerPlugin(ScrollTrigger);

type ScrollFloatProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Match LML observed scroll range. */
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  ready?: boolean;
  as?: "p" | "div" | "span" | "h2";
};

/**
 * Scroll-scrubbed character float — mirrors lml.cc `.scroll-float`.
 * Chars stay unselectable until fully faded/settled, so the red highlight
 * only lands on visible text (and avoids tall transform selection bars).
 */
export function ScrollFloat({
  children,
  className = "",
  id,
  scrollStart = "top 75%",
  scrollEnd = "top 20%",
  stagger = 0.03,
  ready = true,
  as: Tag = "p",
}: ScrollFloatProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ready) return;
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { clearProps: "all" });
      return;
    }

    const split = new SplitType(el, {
      types: "words,chars",
      tagName: "span",
      // Keep words intact so inline-block chars don’t wrap mid-word on mobile
      wordClass: "word inline-block whitespace-nowrap",
      charClass: "char inline-block",
    });

    const chars = split.chars;
    if (!chars?.length) return;

    const VISIBLE_OPACITY = 0.9;
    const SETTLED_SCALE = 1.04;

    const setSelect = (char: HTMLElement, enabled: boolean) => {
      const value = enabled ? "text" : "none";
      if (char.style.userSelect === value) return;
      char.style.userSelect = value;
      char.style.setProperty("-webkit-user-select", value);
    };

    const syncSelectability = () => {
      for (const char of chars) {
        const opacity = Number(gsap.getProperty(char, "opacity"));
        const scaleY = Number(gsap.getProperty(char, "scaleY"));
        setSelect(
          char,
          opacity >= VISIBLE_OPACITY && scaleY <= SETTLED_SCALE,
        );
      }
    };

    gsap.set(chars, {
      willChange: "opacity, transform",
      opacity: 0,
      yPercent: 60,
      scaleY: 1.2,
      scaleX: 1,
      transformOrigin: "50% 0%",
    });
    for (const char of chars) setSelect(char, false);

    const tween = gsap.to(chars, {
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      duration: 1,
      ease: "back.inOut(2)",
      stagger,
      scrollTrigger: {
        trigger: el,
        start: scrollStart,
        end: scrollEnd,
        scrub: true,
        onUpdate: syncSelectability,
        onRefresh: syncSelectability,
      },
    });

    syncSelectability();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [ready, scrollStart, scrollEnd, stagger]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      ref={ref as RefObject<any>}
      id={id}
      className={`scroll-float-text ${className}`}
    >
      {children}
    </Tag>
  );
}

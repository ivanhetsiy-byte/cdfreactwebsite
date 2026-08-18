"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import SplitType from "split-type";

import { scheduleScrollTriggerRefresh } from "@/lib/gsap-refresh";
import { isCoarseOrNarrow, prefersReducedMotion } from "@/lib/motion-env";

gsap.registerPlugin(ScrollTrigger);

function isFooterFade(el: HTMLElement) {
  return Boolean(el.closest("#site-footer, [data-site-footer-cta]"));
}

type FadeInTextTag = "h1" | "h2" | "p" | "span" | "div";

type FadeInTextProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  stagger?: number;
  as?: FadeInTextTag;
  /** Clip rising glyphs. Disable when the line box already crops the type. */
  overflowHidden?: boolean;
  /** Scrub to scroll. Off = play on enter, reset when gone, replay on return. */
  scrub?: boolean;
  trigger?: string;
  scrollStart?: string;
  scrollEnd?: string;
};

/**
 * Characters fade in while rising from below.
 * Default is scrubbed to scroll. Set scrub={false} to play as a timed
 * reveal that restarts when the trigger fully leaves and returns.
 */
export function FadeInText({
  children,
  className = "",
  id,
  stagger = 0.03,
  as: Tag = "span",
  overflowHidden = true,
  scrub = true,
  trigger,
  scrollStart = "top 90%",
  scrollEnd = "top 50%",
}: FadeInTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (isFooterFade(el) && isCoarseOrNarrow()) return;

    const triggerEl = trigger
      ? (document.querySelector(trigger) as HTMLElement | null) ?? el
      : el;
    const cheap = isCoarseOrNarrow() || Tag === "p";
    let split: SplitType | null = null;
    const ctx = gsap.context(() => {
      if (cheap) {
        gsap.fromTo(
          el,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: triggerEl,
              start: scrollStart,
              once: true,
            },
          },
        );
        return;
      }

      split = new SplitType(el, {
        types: "words,chars",
        tagName: "span",
        wordClass: "word inline-block whitespace-nowrap",
        charClass: "char inline-block",
      });
      const chars = split.chars;
      if (!chars?.length) return;

      gsap.fromTo(
        chars,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: scrub ? 1 : 1.05,
          stagger,
          ease: scrub ? "none" : "power3.out",
          scrollTrigger: scrub
            ? {
                trigger: triggerEl,
                start: scrollStart,
                end: scrollEnd,
                scrub: true,
              }
            : {
                trigger: triggerEl,
                start: scrollStart,
                end: scrollEnd,
                toggleActions: "play reset play reset",
              },
        },
      );
    }, el);

    scheduleScrollTriggerRefresh();

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [scrub, scrollEnd, scrollStart, stagger, trigger]);

  return (
    <Tag
      ref={(node) => {
        ref.current = node;
      }}
      id={id}
      className={[
        overflowHidden ? "overflow-hidden" : "",
        Tag === "span" ? "inline-block" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

type FadeInBlockTag = "div" | "span";

type FadeInBlockProps = {
  children: ReactNode;
  className?: string;
  as?: FadeInBlockTag;
  scrollStart?: string;
  scrollEnd?: string;
};

/** Whole-node rise + fade for links that already have hover text rolls. */
export function FadeInBlock({
  children,
  className = "",
  as: Tag = "div",
  scrollStart = "top 90%",
  scrollEnd = "top 50%",
}: FadeInBlockProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (isFooterFade(el) && isCoarseOrNarrow()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        },
      );
    }, el);

    scheduleScrollTriggerRefresh();

    return () => ctx.revert();
  }, [scrollEnd, scrollStart]);

  return (
    <Tag
      ref={(node) => {
        ref.current = node;
      }}
      className={`${Tag === "span" ? "inline-block" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

type ShuffleDirection = "left" | "right" | "up" | "down";

type ShuffleProps = {
  text: string;
  className?: string;
  /** Direction each per-letter strip slides to reveal its final character. */
  shuffleDirection?: ShuffleDirection;
  /** Seconds for one strip to slide. */
  duration?: number;
  ease?: gsap.TweenVars["ease"];
  /** Seconds between strips in "evenodd" mode. */
  stagger?: number;
  /** Interim glyphs each strip rolls past before landing. */
  shuffleTimes?: number;
  /** Glyphs used for the interim rolls; empty repeats the real character. */
  scrambleCharset?: string;
  animationMode?: "evenodd" | "random";
  /** Max random per-strip delay when animationMode is "random". */
  maxDelay?: number;
  /** Portion of the element that must enter view before starting. */
  threshold?: number;
  /** ScrollTrigger start offset, e.g. "-100px". */
  rootMargin?: string;
  triggerOnce?: boolean;
  triggerOnHover?: boolean;
  respectReducedMotion?: boolean;
  /** Must be stable across renders — a new function rebuilds the strips. */
  onShuffleComplete?: () => void;
};

/**
 * Per-character shuffle reveal, adapted from React Bits' Shuffle.
 *
 * Each character is swapped for a clipped strip holding a few interim glyphs
 * plus the real one; sliding the strip lands on the real character. Adapted for
 * this codebase: TypeScript, no `@gsap/react`, styling through `className`, and
 * a plain span so callers can nest it in whatever heading they need.
 *
 * The text starts hidden so the un-split copy never flashes, which means it
 * stays invisible until scrolled into view.
 */
export function Shuffle({
  text,
  className,
  shuffleDirection = "right",
  duration = 0.35,
  ease = "power3.out",
  stagger = 0.03,
  shuffleTimes = 1,
  scrambleCharset = "",
  animationMode = "evenodd",
  maxDelay = 0,
  threshold = 0.1,
  rootMargin = "-100px",
  triggerOnce = true,
  triggerOnHover = false,
  respectReducedMotion = true,
  onShuffleComplete,
}: ShuffleProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const start = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    const match = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || "");
    const value = parseFloat(match?.[1] ?? "0") || 0;
    const unit = match?.[2] || "px";
    const offset =
      value === 0 ? "" : value < 0 ? `-=${Math.abs(value)}${unit}` : `+=${value}${unit}`;
    return `top ${startPct}%${offset}`;
  }, [threshold, rootMargin]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;

    let cancelled = false;
    let split: SplitText | null = null;
    let wrappers: HTMLElement[] = [];
    let tl: gsap.core.Timeline | null = null;
    let trigger: ScrollTrigger | null = null;
    let playing = false;
    let hoverHandler: (() => void) | null = null;

    const isVertical = shuffleDirection === "up" || shuffleDirection === "down";

    const removeHover = () => {
      if (hoverHandler) {
        el.removeEventListener("mouseenter", hoverHandler);
        hoverHandler = null;
      }
    };

    const teardown = () => {
      tl?.kill();
      tl = null;
      // Put the real characters back where their wrappers were
      wrappers.forEach((wrap) => {
        const original = wrap.firstElementChild?.querySelector('[data-orig="1"]');
        if (original && wrap.parentNode) {
          wrap.parentNode.replaceChild(original, wrap);
        }
      });
      wrappers = [];
      split?.revert();
      split = null;
      playing = false;
    };

    const randomGlyph = () =>
      scrambleCharset.charAt(Math.floor(Math.random() * scrambleCharset.length));

    const build = () => {
      teardown();

      split = new SplitText(el, {
        type: "chars",
        charsClass: "shuffle-char",
        smartWrap: true,
        reduceWhiteSpace: false,
      });

      const rolls = Math.max(1, Math.floor(shuffleTimes));

      (split.chars as HTMLElement[]).forEach((char) => {
        const parent = char.parentElement;
        if (!parent) return;

        const { width, height } = char.getBoundingClientRect();
        if (!width) return;

        const wrap = document.createElement("span");
        Object.assign(wrap.style, {
          display: "inline-block",
          overflow: "hidden",
          width: `${width}px`,
          // Horizontal strips keep auto height so tall glyphs are never clipped
          height: isVertical ? `${height}px` : "auto",
          verticalAlign: "bottom",
        });

        const strip = document.createElement("span");
        Object.assign(strip.style, {
          display: "inline-block",
          whiteSpace: isVertical ? "normal" : "nowrap",
          willChange: "transform",
        });

        parent.insertBefore(wrap, char);
        wrap.appendChild(strip);

        const cellStyle = {
          display: isVertical ? "block" : "inline-block",
          width: `${width}px`,
          textAlign: "center" as const,
        };

        const trailingCopy = char.cloneNode(true) as HTMLElement;
        Object.assign(trailingCopy.style, cellStyle);

        char.setAttribute("data-orig", "1");
        Object.assign(char.style, cellStyle);

        strip.appendChild(trailingCopy);
        for (let k = 0; k < rolls; k += 1) {
          const cell = char.cloneNode(true) as HTMLElement;
          cell.removeAttribute("data-orig");
          if (scrambleCharset) cell.textContent = randomGlyph();
          Object.assign(cell.style, cellStyle);
          strip.appendChild(cell);
        }
        strip.appendChild(char);

        const steps = rolls + 1;

        // Forward directions travel the strip the other way, so move the real
        // character to the front and let the spare copy trail behind
        if (shuffleDirection === "right" || shuffleDirection === "down") {
          const spare = strip.firstElementChild;
          const real = strip.lastElementChild;
          if (real) strip.insertBefore(real, strip.firstChild);
          if (spare) strip.appendChild(spare);
        }

        let startX = 0;
        let finalX = 0;
        let startY = 0;
        let finalY = 0;
        if (shuffleDirection === "right") startX = -steps * width;
        else if (shuffleDirection === "left") finalX = -steps * width;
        else if (shuffleDirection === "down") startY = -steps * height;
        else if (shuffleDirection === "up") finalY = -steps * height;

        if (isVertical) {
          gsap.set(strip, { x: 0, y: startY, force3D: true });
          strip.dataset.finalY = String(finalY);
        } else {
          gsap.set(strip, { x: startX, y: 0, force3D: true });
          strip.dataset.finalX = String(finalX);
        }

        wrappers.push(wrap);
      });
    };

    const strips = () =>
      wrappers
        .map((wrap) => wrap.firstElementChild as HTMLElement | null)
        .filter((strip): strip is HTMLElement => Boolean(strip));

    /** Collapse each strip back to just its real character once settled. */
    const settle = () => {
      wrappers.forEach((wrap) => {
        const strip = wrap.firstElementChild as HTMLElement | null;
        const real = strip?.querySelector('[data-orig="1"]');
        if (!strip || !real) return;
        strip.replaceChildren(real);
        strip.style.transform = "none";
        strip.style.willChange = "auto";
      });
    };

    const play = () => {
      const targets = strips();
      if (!targets.length) return;

      playing = true;
      tl = gsap.timeline({
        smoothChildTiming: true,
        onComplete: () => {
          playing = false;
          settle();
          onShuffleComplete?.();
          armHover();
        },
      });

      const slide = (subset: HTMLElement[], at: number) => {
        const vars: gsap.TweenVars = {
          duration,
          ease,
          force3D: true,
          stagger: animationMode === "evenodd" ? stagger : 0,
        };
        if (isVertical) {
          vars.y = (_i: number, t: HTMLElement) => Number(t.dataset.finalY ?? 0);
        } else {
          vars.x = (_i: number, t: HTMLElement) => Number(t.dataset.finalX ?? 0);
        }
        tl?.to(subset, vars, at);
      };

      if (animationMode === "evenodd") {
        const odd = targets.filter((_, i) => i % 2 === 1);
        const even = targets.filter((_, i) => i % 2 === 0);
        const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
        if (odd.length) slide(odd, 0);
        if (even.length) slide(even, odd.length ? oddTotal * 0.7 : 0);
      } else {
        targets.forEach((strip) => slide([strip], Math.random() * maxDelay));
      }
    };

    const armHover = () => {
      if (!triggerOnHover) return;
      removeHover();
      hoverHandler = () => {
        if (playing) return;
        build();
        play();
      };
      el.addEventListener("mouseenter", hoverHandler);
    };

    const init = () => {
      if (cancelled) return;

      if (
        respectReducedMotion &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        el.style.visibility = "visible";
        onShuffleComplete?.();
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: triggerOnce,
        onEnter: () => {
          build();
          play();
          armHover();
          el.style.visibility = "visible";
        },
      });
    };

    // Strip widths come from measured glyphs, so wait for the real font
    const fontsReady =
      "fonts" in document && document.fonts.status !== "loaded"
        ? document.fonts.ready
        : Promise.resolve();
    void fontsReady.then(init);

    return () => {
      cancelled = true;
      trigger?.kill();
      removeHover();
      teardown();
      el.style.visibility = "hidden";
    };
  }, [
    text,
    start,
    shuffleDirection,
    duration,
    ease,
    stagger,
    shuffleTimes,
    scrambleCharset,
    animationMode,
    maxDelay,
    triggerOnce,
    triggerOnHover,
    respectReducedMotion,
    onShuffleComplete,
  ]);

  return (
    <span ref={ref} className={className} style={{ visibility: "hidden" }}>
      {text}
    </span>
  );
}

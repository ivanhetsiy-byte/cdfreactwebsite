"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { cormorantGaramond } from "@/app/fonts";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

/**
 * Figma Hero Final Redesign `2098:51` — 1440 × 900.
 * Site Navbar via LabShell (Figma header/logo not rendered).
 * Season 12: bottom-pinned, guttered, width-fitted on every viewport.
 */
const FD = {
  W: 1440,
  H: 900,
  enrollment: {
    y: 341,
    size: 120,
    leading: 1.087,
  },
  /** Secondary anchors (not in 2098:51; required copy slots). */
  disciplines: {
    x: 10,
    y: 96,
    size: 14,
    leading: 1.087,
  },
  dance: {
    x: 1337,
    y: 96,
    size: 72,
    leading: 1.05,
  },
} as const;

/** Fixed desktop/tablet inset from viewport edges for Season 12. */
const SEASON_GUTTER = "1.25rem";

const DISCIPLINES_LINE = "Jazz - Ballet - Acrobatics - Gymnastics";

const DANCE_LETTERS = ["D", "A", "N", "C", "E"] as const;

const EASE = "power3.out";

const HERO_CSS = `
[data-hero2098-root] {
  --hero-s: min(100vw / ${FD.W}px, 100dvh / ${FD.H}px);
  --hero-gutter: ${SEASON_GUTTER};
  position: relative;
  width: 100%;
  max-width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: #ffffff;
  color: #000000;
}

/* Keep layout metrics; hide unused DANCE column only. */
[data-hero2098-dance] {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
}

[data-hero2098-disciplines] {
  position: relative;
  z-index: 2;
  margin: 0;
  padding: 0;
  font-family: var(--font-helvetica), "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 400;
  font-size: clamp(1.125rem, 2.4vw, 1.75rem);
  line-height: 1.15;
  letter-spacing: 0.01em;
  color: #000;
  white-space: nowrap;
  text-align: left;
}

[data-hero2098-enrollment] {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(${FD.enrollment.y}px * var(--hero-s));
  z-index: 2;
  margin: 0 auto;
  width: max-content;
  max-width: calc(100% - 2 * var(--hero-gutter));
  font-family: var(--font-cormorant-garamond), "Cormorant Garamond", Georgia, serif;
  font-weight: 500;
  font-size: calc(${FD.enrollment.size}px * var(--hero-s));
  line-height: ${FD.enrollment.leading};
  letter-spacing: 0;
  color: #000;
  text-decoration: none;
  white-space: nowrap;
  text-align: center;
  transition: opacity 0.25s ease;
}

[data-hero2098-enrollment]:hover {
  opacity: 0.55;
}

[data-hero2098-enrollment]:focus-visible {
  outline: 2px solid #000;
  outline-offset: 4px;
}

[data-hero2098-dance] {
  position: absolute;
  right: var(--hero-gutter);
  top: calc(${FD.dance.y}px * var(--hero-s));
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin: 0;
  font-family: var(--font-helvetica), "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 400;
  font-size: calc(${FD.dance.size}px * var(--hero-s));
  line-height: ${FD.dance.leading};
  letter-spacing: 0;
  text-transform: uppercase;
  pointer-events: none;
  user-select: none;
}

[data-hero2098-dance] span {
  display: block;
}

/* Season block: bottom-pinned; L/R gutters; disciplines stacked above Season. */
[data-hero2098-season-wrap] {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: auto;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  width: 100%;
  max-width: 100vw;
  padding-inline: var(--hero-gutter);
  overflow: visible;
}

[data-hero2098-season] {
  display: block;
  position: relative;
  /*
   * Helvetica Black caps leave empty descent in the em box (~0.23em).
   * Shift ink down so letter bottoms sit on the viewport; root overflow
   * clips the empty em below. Negative margin cancels the extra layout
   * gap so disciplines sit just above the Season glyphs.
   */
  top: 0.23em;
  margin-top: -0.23em;
  width: 100%;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
  font-family: var(--font-helvetica), "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 900;
  font-size: 12vw;
  line-height: 1;
  letter-spacing: 0;
  color: #000;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: left;
  pointer-events: none;
  user-select: none;
}

@media (max-width: 767px) {
  [data-hero2098-root] {
    --hero-gutter: 1rem;
  }

  [data-hero2098-enrollment] {
    left: var(--hero-gutter);
    right: var(--hero-gutter);
    top: 50%;
    /* Independent of GSAP transform so entrance y still works */
    translate: 0 -50%;
    width: auto;
    max-width: none;
    white-space: normal;
    text-wrap: balance;
    font-size: clamp(2rem, 8vw, 4.5rem);
  }

  [data-hero2098-dance] {
    font-size: clamp(1.5rem, 8vw, 2.75rem);
  }

  [data-hero2098-disciplines] {
    font-size: clamp(0.9375rem, 3.2vw, 1.25rem);
  }

  [data-hero2098-season-wrap] {
    gap: 0.3rem;
  }
}
`;

/** Grow font-size to fill width, then nudge tracking for leftover pixels. */
function fitSeasonToWidth(el: HTMLElement, availableWidth: number) {
  if (availableWidth <= 0) return;

  el.style.letterSpacing = "0px";

  let lo = 8;
  let hi = Math.max(availableWidth, 8);

  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    el.style.fontSize = `${mid}px`;
    if (el.scrollWidth <= availableWidth) lo = mid;
    else hi = mid;
  }

  el.style.fontSize = `${lo}px`;

  const gaps = Math.max((el.textContent ?? "").length - 1, 1);
  const extra = availableWidth - el.scrollWidth;
  el.style.letterSpacing = extra > 0 ? `${extra / gaps}px` : "0px";
}

export function Hero() {
  const go = useDelayedNavigation();
  const rootRef = useRef<HTMLElement>(null);
  const seasonWrapRef = useRef<HTMLDivElement>(null);
  const seasonRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const wrap = seasonWrapRef.current;
    const season = seasonRef.current;
    if (!wrap || !season) return;

    const run = () => {
      const style = getComputedStyle(wrap);
      const padL = parseFloat(style.paddingLeft) || 0;
      const padR = parseFloat(style.paddingRight) || 0;
      const available = Math.max(wrap.clientWidth - padL - padR, 0);
      fitSeasonToWidth(season, available);
    };

    const ro = new ResizeObserver(run);
    ro.observe(wrap);

    void document.fonts?.ready.then(run);
    run();

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const disciplines = root.querySelector<HTMLElement>(
      "[data-hero2098-disciplines]",
    );
    const enrollment = root.querySelector<HTMLElement>(
      "[data-hero2098-enrollment]",
    );
    const danceLetters = root.querySelectorAll<HTMLElement>(
      "[data-hero2098-dance] span",
    );
    const season = seasonRef.current;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [disciplines, enrollment, ...danceLetters, season].filter(Boolean),
          { opacity: 1, y: 0 },
        );
        return;
      }

      gsap.set(disciplines, { opacity: 0, y: 8 });
      gsap.set(enrollment, { opacity: 0, y: 16 });
      gsap.set(danceLetters, { opacity: 0, y: 10 });
      gsap.set(season, { opacity: 0, y: 20 });

      gsap
        .timeline({ defaults: { ease: EASE } })
        .to(disciplines, { opacity: 1, y: 0, duration: 0.5 }, 0.08)
        .to(enrollment, { opacity: 1, y: 0, duration: 0.7 }, 0.18)
        .to(
          danceLetters,
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 },
          0.26,
        )
        .to(season, { opacity: 1, y: 0, duration: 0.9, ease: "power4.out" }, 0.36);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      data-hero2098-root
      aria-labelledby="hero-2098-heading"
      className={cormorantGaramond.variable}
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

      <h1 id="hero-2098-heading" className="sr-only">
        CDF Dance — Season 12. Enrollment now open. Jazz, Ballet, Acrobatics,
        Gymnastics.
      </h1>

      <p data-hero2098-dance aria-hidden="true">
        {DANCE_LETTERS.map((char) => (
          <span key={char}>{char}</span>
        ))}
      </p>

      <Link
        data-hero2098-enrollment
        href="/contact"
        aria-label="Enrollment Now Open"
        onClick={(e) => {
          e.preventDefault();
          go("/contact");
        }}
      >
        Enrollment Now Open
      </Link>

      <div ref={seasonWrapRef} data-hero2098-season-wrap>
        <p data-hero2098-disciplines>{DISCIPLINES_LINE}</p>
        <p ref={seasonRef} data-hero2098-season aria-hidden="true">
          Season 12
        </p>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

import { LightRays } from "@/components/backgrounds/LightRays";
import {
  ABOUT_WHERE_HASH,
  COMPETITIONS,
  competitionHref,
} from "@/lib/competitions";
import { getLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-choreographed "Where We've Been" section.
 *
 * A tall runway pins a full-viewport stage. Heading chars rise on white, then
 * one scroll snaps to the black state: curtain up, heading white and moved to
 * the top, light rays in, all five names revealed at once.
 *
 * Opening a name swaps it for its achievement on a full-bleed white band —
 * hover on desktop, tap to toggle on mobile. An ↗ in the band corner links
 * through to that competition's (wireframe) detail page.
 */
export function AboutWhereWeveBeen() {
  const sectionRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  /** Active black-stage timeline — hash land completes it without a scroll crossing. */
  const snapRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const curtain = curtainRef.current;
    const rays = raysRef.current;
    const headingWrap = headingWrapRef.current;
    const heading = headingRef.current;
    const list = listRef.current;
    if (
      !section ||
      !runway ||
      !stage ||
      !curtain ||
      !rays ||
      !headingWrap ||
      !heading ||
      !list
    ) {
      return;
    }

    const rows = rowRefs.current.filter(Boolean) as HTMLLIElement[];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(curtain, { clipPath: "inset(0% 0 0 0)" });
      gsap.set(rays, { opacity: 1 });
      gsap.set(heading, { color: "#ffffff" });
      gsap.set(headingWrap, { clearProps: "transform" });
      gsap.set(list, { opacity: 1 });
      rows.forEach((row) => {
        const band = row.querySelector<HTMLElement>("[data-band]");
        const name = row.querySelector<HTMLElement>("[data-name]");
        const achievement = row.querySelector<HTMLElement>("[data-achievement]");
        const arrow = row.querySelector<HTMLElement>("[data-arrow]");
        gsap.set(row, { opacity: 1, yPercent: 0 });
        if (band) gsap.set(band, { scaleX: 0 });
        if (name) gsap.set(name, { yPercent: 0 });
        if (achievement) gsap.set(achievement, { yPercent: 100 });
        // Keep the detail link reachable without the hover choreography
        if (arrow) gsap.set(arrow, { opacity: 1, pointerEvents: "auto" });
      });
      return;
    }

    const split = new SplitType(heading, {
      types: "chars",
      tagName: "span",
      charClass: "char inline-block",
    });
    const chars = split.chars ?? [];

    const rowTimelines: gsap.core.Timeline[] = [];
    let activeIndex: number | null = null;

    const setActive = (index: number | null) => {
      if (activeIndex === index) return;
      if (activeIndex !== null) {
        rowTimelines[activeIndex]?.reverse();
      }
      activeIndex = index;
      if (index !== null) {
        rowTimelines[index]?.play();
      }
    };

    rows.forEach((row) => {
      const band = row.querySelector<HTMLElement>("[data-band]");
      const name = row.querySelector<HTMLElement>("[data-name]");
      const achievement = row.querySelector<HTMLElement>("[data-achievement]");
      const arrow = row.querySelector<HTMLElement>("[data-arrow]");
      if (!band || !name || !achievement || !arrow) return;

      gsap.set(band, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(name, { yPercent: 0 });
      gsap.set(achievement, { yPercent: 100 });
      gsap.set(arrow, { opacity: 0, scale: 0.7, pointerEvents: "none" });

      const tl = gsap
        .timeline({ paused: true })
        .to(band, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, 0)
        .to(name, { yPercent: -100, duration: 0.45, ease: "power3.inOut" }, 0)
        .to(achievement, { yPercent: 0, duration: 0.45, ease: "power3.inOut" }, 0)
        .to(
          arrow,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: "power2.out",
            pointerEvents: "auto",
          },
          0.15,
        );

      rowTimelines.push(tl);
    });

    /** Offset that visually centres the flow-positioned heading in the stage. */
    const centreOffset = () => {
      const current = Number(gsap.getProperty(headingWrap, "y")) || 0;
      const untransformedTop =
        headingWrap.getBoundingClientRect().top - current;
      const stageTop = stage.getBoundingClientRect().top;
      const centred =
        stageTop + (stage.clientHeight - headingWrap.offsetHeight) / 2;
      return centred - untransformedTop;
    };

    /**
     * The white "Where We've Been" state, then a single self-running snap to the
     * full black state. Deliberately not scrubbed — there are exactly two states
     * and no partial in-between renders.
     */
    const buildSnap = () => {
      gsap.set(chars, {
        opacity: 0,
        yPercent: 110,
        willChange: "opacity, transform",
      });
      gsap.set(curtain, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(rays, { opacity: 0 });
      gsap.set(heading, { color: "#000000" });
      gsap.set(rows, {
        opacity: 0,
        yPercent: 24,
        willChange: "opacity, transform",
      });
      gsap.set(headingWrap, { y: centreOffset });

      // State 1 — heading rises on the white page as the section approaches.
      // Overflow on the wrap clips the rising glyphs so they can never paint
      // over the competition list below, even mid-tween.
      gsap.fromTo(
        chars,
        { opacity: 0, yPercent: 110 },
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.02,
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: "top 30%",
            toggleActions: "play none play reverse",
          },
          onComplete: () => {
            // Drop the leftover translate so layout and paint agree — a residual
            // yPercent is what was letting the glyphs sit on top of SHOWSTOPPER.
            gsap.set(chars, { clearProps: "transform,willChange" });
          },
        },
      );

      // State 2 — one scroll past the threshold snaps everything to black
      const snap = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
      });

      snap.to(curtain, { clipPath: "inset(0% 0 0 0)", duration: 0.55 }, 0);
      snap.to(heading, { color: "#ffffff", duration: 0.35 }, 0.1);
      snap.to(rays, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.2);
      snap.to(headingWrap, { y: 0, duration: 0.6 }, 0);

      // All five names together — once the heading has finished sliding up so
      // it is no longer travelling through the row stack.
      snap.to(
        rows,
        { opacity: 1, yPercent: 0, duration: 0.5, ease: "power3.out" },
        0.55,
      );

      const snapTrigger = ScrollTrigger.create({
        trigger: runway,
        // A short beat after the stage pins, so the white state reads first
        start: () => `top top-=${Math.round(window.innerHeight * 0.2)}`,
        invalidateOnRefresh: true,
        onEnter: () => snap.play(),
        onLeaveBack: () => snap.reverse(),
      });

      snapRef.current = snap;

      // Deep links can land past the threshold before this trigger exists —
      // onEnter never fires for a crossing that already happened, so sync.
      if (snapTrigger.scroll() >= snapTrigger.start) {
        snap.progress(1).pause();
      }

      return snap;
    };

    const mm = gsap.matchMedia();

    // ── Desktop: sticky stage, hover-driven rows ───────────────────────────
    mm.add("(min-width: 768px)", () => {
      const snap = buildSnap();

      const handlers: Array<{
        row: HTMLLIElement;
        enter: () => void;
        leave: () => void;
      }> = [];

      rows.forEach((row, i) => {
        const enter = () => setActive(i);
        const leave = () => setActive(null);
        row.addEventListener("pointerenter", enter);
        row.addEventListener("pointerleave", leave);
        handlers.push({ row, enter, leave });
      });

      return () => {
        handlers.forEach(({ row, enter, leave }) => {
          row.removeEventListener("pointerenter", enter);
          row.removeEventListener("pointerleave", leave);
        });
        setActive(null);
        if (snapRef.current === snap) snapRef.current = null;
        snap.kill();
      };
    });

    // ── Mobile: tap a row to open its hover state; tap again to close ──────
    mm.add("(max-width: 767px)", () => {
      const snap = buildSnap();

      const handlers: Array<{ row: HTMLLIElement; click: (e: Event) => void }> =
        [];

      rows.forEach((row, i) => {
        const click = (e: Event) => {
          // Arrow navigates on its own — don't toggle the row shut underneath it
          if ((e.target as Element | null)?.closest?.("[data-arrow]")) return;
          setActive(activeIndex === i ? null : i);
        };
        row.addEventListener("click", click);
        handlers.push({ row, click });
      });

      return () => {
        handlers.forEach(({ row, click }) => {
          row.removeEventListener("click", click);
        });
        setActive(null);
        if (snapRef.current === snap) snapRef.current = null;
        snap.kill();
      };
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
      rowTimelines.forEach((t) => t.kill());
      split.revert();
    };
  }, []);

  // Competition "← About" links land here. Pins above this section change its
  // document Y, so we re-scroll after ScrollTrigger has measured them.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== `#${ABOUT_WHERE_HASH}`) return;

    let cancelled = false;

    const land = () => {
      if (cancelled) return;
      const el = document.getElementById(ABOUT_WHERE_HASH);
      if (!el) return;

      ScrollTrigger.refresh();

      const y = el.getBoundingClientRect().top + window.scrollY;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(y, { immediate: true, force: true });
      } else {
        window.scrollTo(0, y);
      }
      ScrollTrigger.update();
      // Jumping past the snap threshold skips onEnter — complete the stage here.
      snapRef.current?.progress(1).pause();
    };

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(land);
    });
    const t1 = window.setTimeout(land, 120);
    const t2 = window.setTimeout(land, 360);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-where-heading"
      className="relative w-full overflow-x-clip bg-white"
    >
      {/* The runway holds the sticky stage: a beat of white, the snap to black,
          then dwell time to open names (hover / tap) and follow the arrow. */}
      <div ref={runwayRef} className="relative h-[180vh] md:h-[250vh]">
        {/* Deep-link target — sits past the white beat so #where-weve-been
            opens on the snapped black stage the competition arrows leave from. */}
        <div
          id={ABOUT_WHERE_HASH}
          aria-hidden
          className="pointer-events-none absolute top-[25vh] left-0 h-px w-px"
        />        {/* Full-viewport stage. Content is top-aligned, so whatever height the
            names do not need is simply black rather than stretched type. */}
        <div
          ref={stageRef}
          className="sticky top-0 flex h-svh w-full flex-col overflow-hidden"
        >
          {/* Black curtain — covers the stage (desktop sticky / mobile growing) */}
          <div
            ref={curtainRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 bg-black"
            style={{ clipPath: "inset(100% 0 0 0)" }}
          />

          {/* Light rays */}
          <div
            ref={raysRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] opacity-0"
          >
            <LightRays
              raysOrigin="top-center"
              raysColor="#ffffff"
              raysSpeed={1.1}
              lightSpread={0.3}
              rayLength={2}
              fadeDistance={2}
              saturation={0.9}
              noiseAmount={0.12}
              followMouse={false}
            />
          </div>

          {/* Content — normal flow so the heading and rows can never overlap.
              GSAP centres the heading with a transform, then slides it to 0. */}
          <div className="relative z-10 flex h-full w-full flex-col px-6 pt-[max(5rem,12vh)] pb-[max(2rem,5vh)] md:px-10">
            <div ref={headingWrapRef} className="z-10 shrink-0">
              {/* Overflow clips the rising glyphs to the line box so a leftover
                  translate can never paint them over the rows below. */}
              <div className="overflow-hidden">
                <h2
                  id="about-where-heading"
                  ref={headingRef}
                  className="font-swiss whitespace-nowrap text-[min(10.6vw,13vh)] font-normal leading-none tracking-tight text-black"
                >
                  Where We&rsquo;ve Been
                </h2>
              </div>
              {/* Gap scales with the heading. Mobile has room for a generous
                  beat; desktop has to stay tighter so FLY still clears the fold. */}
              <div
                aria-hidden
                className="h-[1.75em] text-[min(10.6vw,13vh)] md:h-[0.75em]"
              />
            </div>

            {/* Competition list */}
            <ul
              ref={listRef}
              aria-label="Competitions"
              className="relative z-10 flex flex-col"
            >
              {COMPETITIONS.map((comp, index) => (
                <li
                  key={comp.slug}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  aria-label={`${comp.name} — ${comp.achievement}`}
                  className="relative cursor-pointer md:cursor-default"
                >
                  {/* Full-bleed white band — negative insets cancel the page gutter */}
                  <span
                    data-band
                    aria-hidden
                    className="pointer-events-none absolute inset-y-[4%] -left-6 -right-6 z-0 bg-white md:-left-10 md:-right-10"
                  />

                  {/* Label box clips the vertical roll; full width so the longer
                      achievement is not cut off horizontally. */}
                  <span
                    aria-hidden
                    className="relative z-10 block w-full overflow-hidden leading-[1.15]"
                  >
                    <span
                      data-name
                      className="font-swiss block whitespace-nowrap text-[min(9vw,10.5vh)] font-normal leading-[1.15] tracking-tight text-white"
                    >
                      {comp.name}
                    </span>
                    <span
                      data-achievement
                      className="font-swiss absolute inset-0 block whitespace-nowrap text-[min(9vw,10.5vh)] font-normal leading-[1.15] tracking-tight text-black"
                    >
                      {comp.achievement}
                    </span>
                  </span>

                  {/* ↗ — revealed with the band and sized to fill its height. On
                      mobile it sits in the band's full-bleed gutter, where the
                      long achievement text would otherwise run into it. */}
                  <Link
                    data-arrow
                    href={competitionHref(comp.slug)}
                    aria-label={`Open ${comp.name} competition page`}
                    className="absolute inset-y-[6%] -right-4 z-20 flex aspect-square items-center justify-center text-black opacity-0 md:right-0"
                  >
                    {/* Tight viewBox so the stroke itself spans the band, not
                        just the box it sits in. */}
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      fill="none"
                      className="size-full"
                    >
                      <path
                        d="M2 18L18 2M18 2H8M18 2V12"
                        stroke="currentColor"
                        strokeWidth="1.35"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

import {
  ABOUT_WHERE_HASH,
  COMPETITIONS,
  competitionHref,
} from "@/lib/competitions";
import { getLenis } from "@/lib/lenis";
import { MOTION_MQ } from "@/lib/motion-env";

const LightRays = dynamic(
  () =>
    import("@/components/backgrounds/LightRays").then((m) => m.LightRays),
  { ssr: false },
);

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-choreographed "Where We've Been" section.
 *
 * Desktop fine-pointer: tall runway + sticky stage scrubbed white → black.
 * Touch / coarse / narrow: normal document flow + one-shot reveal (no sticky
 * scrub) so native scroll does not paint in stepped frames.
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
  /** Scrubbed / one-shot black-stage timeline — hash land forces complete. */
  const scrubRef = useRef<gsap.core.Timeline | null>(null);
  /** Defer rays until the reveal starts. */
  const [mountRays, setMountRays] = useState(false);
  const [desktopFine, setDesktopFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOTION_MQ.desktopFine);
    const sync = () => setDesktopFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
    const reduced = window.matchMedia(MOTION_MQ.reduced).matches;

    if (reduced) {
      gsap.set(curtain, { clearProps: "clipPath", opacity: 1, yPercent: 0 });
      gsap.set(rays, { opacity: 1 });
      gsap.set(heading, { color: "#ffffff" });
      gsap.set(headingWrap, { clearProps: "transform" });
      gsap.set(list, { opacity: 1 });
      setMountRays(true);
      rows.forEach((row) => {
        const band = row.querySelector<HTMLElement>("[data-band]");
        const name = row.querySelector<HTMLElement>("[data-name]");
        const achievement = row.querySelector<HTMLElement>("[data-achievement]");
        const arrow = row.querySelector<HTMLElement>("[data-arrow]");
        gsap.set(row, { opacity: 1, yPercent: 0 });
        if (band) gsap.set(band, { scaleX: 0 });
        if (name) gsap.set(name, { yPercent: 0 });
        if (achievement) gsap.set(achievement, { yPercent: 100 });
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

    const centreOffset = () => {
      const current = Number(gsap.getProperty(headingWrap, "y")) || 0;
      const untransformedTop =
        headingWrap.getBoundingClientRect().top - current;
      const stageTop = stage.getBoundingClientRect().top;
      const centred =
        stageTop + (stage.clientHeight - headingWrap.offsetHeight) / 2;
      return centred - untransformedTop;
    };

    const mm = gsap.matchMedia();

    // ── Desktop fine-pointer: sticky scrub + hover rows ─────────────────────
    mm.add(MOTION_MQ.desktopFine, () => {
      gsap.set(chars, {
        opacity: 0,
        yPercent: 110,
        willChange: "opacity, transform",
      });
      gsap.set(curtain, { clipPath: "inset(100% 0 0 0)", opacity: 1, yPercent: 0 });
      gsap.set(rays, { opacity: 0 });
      gsap.set(heading, { color: "#000000" });
      gsap.set(rows, {
        opacity: 0,
        yPercent: 24,
        willChange: "opacity, transform",
      });
      gsap.set(headingWrap, { y: centreOffset });

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
            gsap.set(chars, { clearProps: "transform,willChange" });
          },
        },
      );

      const scrub = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: runway,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      scrub.to(curtain, { clipPath: "inset(0% 0 0 0)", duration: 0.55 }, 0);
      scrub.to(heading, { color: "#ffffff", duration: 0.35 }, 0.1);
      scrub.to(
        rays,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power1.out",
          onStart: () => setMountRays(true),
        },
        0.2,
      );
      scrub.fromTo(
        headingWrap,
        { y: () => centreOffset() },
        { y: 0, duration: 0.6, immediateRender: false },
        0,
      );
      scrub.to(
        rows,
        { opacity: 1, yPercent: 0, duration: 0.5, ease: "power3.out" },
        0.55,
      );

      scrubRef.current = scrub;

      const st = scrub.scrollTrigger;
      if (st && st.scroll() >= st.start) {
        setMountRays(true);
        scrub.progress(1);
      }

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
        if (scrubRef.current === scrub) scrubRef.current = null;
        scrub.scrollTrigger?.kill();
        scrub.kill();
      };
    });

    // ── Touch / coarse / narrow: flow layout + one-shot reveal + tap rows ───
    // Negation of desktopFine = (max-width: 767px) OR (pointer: coarse).
    mm.add("(max-width: 767px), (pointer: coarse)", () => {
      gsap.set(curtain, {
        clearProps: "clipPath",
        opacity: 0,
        yPercent: 8,
      });
      gsap.set(rays, { opacity: 0 });
      gsap.set(heading, { color: "#000000" });
      gsap.set(headingWrap, { clearProps: "transform" });
      gsap.set(rows, { opacity: 0, yPercent: 16 });
      gsap.set(chars, {
        opacity: 0,
        yPercent: 110,
      });

      gsap.fromTo(
        chars,
        { opacity: 0, yPercent: 110 },
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.02,
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          onComplete: () => {
            gsap.set(chars, { clearProps: "transform" });
          },
        },
      );

      const reveal = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: stage,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      reveal.to(curtain, { opacity: 1, yPercent: 0, duration: 0.55 }, 0);
      reveal.to(heading, { color: "#ffffff", duration: 0.35 }, 0.08);
      reveal.to(
        rays,
        {
          opacity: 1,
          duration: 0.5,
          onStart: () => setMountRays(true),
        },
        0.12,
      );
      reveal.to(
        rows,
        { opacity: 1, yPercent: 0, duration: 0.45, stagger: 0.04 },
        0.28,
      );

      scrubRef.current = reveal;

      const handlers: Array<{ row: HTMLLIElement; click: (e: Event) => void }> =
        [];

      rows.forEach((row, i) => {
        const click = (e: Event) => {
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
        if (scrubRef.current === reveal) scrubRef.current = null;
        reveal.scrollTrigger?.kill();
        reveal.kill();
      };
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
      rowTimelines.forEach((t) => t.kill());
      split.revert();
    };
  }, []);

  // Competition "← About" links land here.
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
      setMountRays(true);
      scrubRef.current?.progress(1);
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
      <div
        ref={runwayRef}
        className={
          desktopFine ? "relative h-[250vh]" : "relative min-h-0"
        }
      >
        <div
          id={ABOUT_WHERE_HASH}
          aria-hidden
          className={
            desktopFine
              ? "pointer-events-none absolute top-[calc(100%-100svh)] left-0 h-px w-px"
              : "pointer-events-none absolute top-0 left-0 h-px w-px"
          }
        />
        <div
          ref={stageRef}
          className={
            desktopFine
              ? "sticky top-0 flex h-svh w-full flex-col overflow-hidden"
              : "relative flex min-h-svh w-full flex-col overflow-hidden"
          }
        >
          <div
            ref={curtainRef}
            aria-hidden
            data-nav-page-surface="dark"
            className="pointer-events-none absolute inset-0 z-0 bg-black"
            style={
              desktopFine
                ? { clipPath: "inset(100% 0 0 0)" }
                : { opacity: 0 }
            }
          />

          <div
            ref={raysRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] opacity-0"
          >
            {mountRays ? (
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
            ) : null}
          </div>

          <div className="relative z-10 flex h-full w-full flex-col px-6 pt-[max(5rem,12vh)] pb-[max(2rem,5vh)] md:px-10">
            <div ref={headingWrapRef} className="z-10 shrink-0">
              <div className="overflow-hidden">
                <h2
                  id="about-where-heading"
                  ref={headingRef}
                  className="font-swiss whitespace-nowrap text-[min(10.6vw,13vh)] font-normal leading-none tracking-tight text-black"
                >
                  Where We&rsquo;ve Been
                </h2>
              </div>
              <div
                aria-hidden
                className="h-[1.75em] text-[min(10.6vw,13vh)] md:h-[0.75em]"
              />
            </div>

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
                  <span
                    data-band
                    aria-hidden
                    className="pointer-events-none absolute inset-y-[4%] -left-6 -right-6 z-0 bg-white md:-left-10 md:-right-10"
                  />

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

                  <Link
                    data-arrow
                    href={competitionHref(comp.slug)}
                    aria-label={`Open ${comp.name} competition page`}
                    className="absolute inset-y-[6%] -right-4 z-20 flex aspect-square items-center justify-center text-black opacity-0 md:right-0"
                  >
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

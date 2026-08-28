"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import SplitType from "split-type";

import {
  ABOUT_BLURB,
  ABOUT_NAME,
  BIO,
  HERO_SUBTITLE,
  HERO_TITLE,
  TAGLINE_LINES,
  TEAM,
} from "./content";
import { CustomScrollbar } from "./CustomScrollbar";
import { LabScrollProvider } from "./LabScrollProvider";
import { NoiseOverlay } from "./NoiseOverlay";
import { PortraitCanvas } from "./PortraitCanvas";
import { ScrollFloat } from "./ScrollFloat";
import { StudioFooterBar } from "./StudioFooterBar";
import { StudioHeader } from "./StudioHeader";
import { isCoarseOrNarrow, prefersReducedMotion } from "@/lib/motion-env";

gsap.registerPlugin(ScrollTrigger);

/** Document Y of an element via offsetParent chain (same as lml.cc studio). */
function offsetTopSum(el: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function StudioContent({
  ready,
  theme = "dark",
}: {
  ready: boolean;
  theme?: "dark" | "light";
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const isLight = theme === "light";
  const surface = isLight ? "bg-white text-black" : "bg-black text-white";
  const portraitWell = isLight ? "bg-neutral-100" : "bg-black";
  const aboutPill = isLight
    ? "border-white/40 text-white/60"
    : "border-white/50 text-white/70";
  const teamInk = isLight ? "text-black" : "text-white";

  useEffect(() => {
    if (!ready) return;
    if (prefersReducedMotion()) return;

    let cssCleanup: (() => void) | undefined;
    const cheap = isCoarseOrNarrow();

    const ctx = gsap.context(() => {
      const splits: SplitType[] = [];

      // Hero title — load entrance (not scrubbed on LML)
      if (titleRef.current && !cheap) {
        const split = new SplitType(titleRef.current, { types: "chars" });
        splits.push(split);
        gsap.fromTo(
          split.chars,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.04,
            ease: "power3.out",
            delay: 0.05,
          },
        );
      } else if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }

      gsap.from(".lml-found", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.45,
      });

      // Portrait entrance: opacity only (scroll owns Y motion).
      // Skip on touch — GSAP transform on this node fights the CSS timeline.
      if (!cheap && portraitRef.current) {
        gsap.from(portraitRef.current, {
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.25,
        });
      }

      /**
       * Portrait scroll travel. Desktop: y ends when portrait center ==
       * tagline center. Mobile: park in the landing well so the tagline
       * and bio sit below the photo, not on it.
       */
      if (portraitRef.current && taglineRef.current) {
        const portrait = portraitRef.current;
        const tagline = taglineRef.current;

        const parkingWell = () => {
          const well = landingRef.current;
          if (
            well &&
            well.offsetParent !== null &&
            well.offsetHeight > 0
          ) {
            return well;
          }
          return null;
        };

        const getTravelY = () => {
          const well = parkingWell();
          if (well) {
            return offsetTopSum(well) - offsetTopSum(portrait);
          }
          const portraitCenter =
            offsetTopSum(portrait) + portrait.offsetHeight / 2;
          const taglineCenter =
            offsetTopSum(tagline) + tagline.offsetHeight / 2;
          return taglineCenter - portraitCenter;
        };

        const cssOk =
          cheap &&
          typeof CSS !== "undefined" &&
          CSS.supports("animation-timeline", "scroll()");

        if (cssOk) {
          const applyCssTravel = () => {
            const dest = parkingWell() ?? tagline;
            const start = Math.round(offsetTopSum(portrait));
            const end = Math.max(start + 1, Math.round(offsetTopSum(dest)));
            const travel = Math.max(0, end - start);
            portrait.style.setProperty("--lml-portrait-travel", `${travel}px`);
            portrait.style.setProperty("animation-range", `${start}px ${end}px`);
          };

          portrait.classList.add("cdf-staff-portrait-css");
          applyCssTravel();
          window.addEventListener("resize", applyCssTravel);
          void document.fonts?.ready.then(applyCssTravel);
          cssCleanup = () => {
            window.removeEventListener("resize", applyCssTravel);
            portrait.classList.remove("cdf-staff-portrait-css");
            portrait.style.removeProperty("--lml-portrait-travel");
            portrait.style.removeProperty("animation-range");
          };
        } else {
        const dest = parkingWell() ?? tagline;
        gsap.set(portrait, { y: 0 });
        gsap.fromTo(
          portrait,
          { y: 0 },
          {
            y: getTravelY,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: portrait,
              start: "top top",
              endTrigger: dest,
              end: dest === landingRef.current ? "top top" : "center center",
              scrub: cheap ? true : 0.6,
              invalidateOnRefresh: true,
            },
          },
        );
        }
      }

      if (!cheap) {
      // About pill — scrubbed slide/fade like LML
      gsap.fromTo(
        ".lml-about-pill",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".lml-about-pill",
            start: "top 90%",
            end: "top 60%",
            scrub: true,
          },
        },
      );

      // Bio — whole-block scrub (opacity + y), matches LML
      if (bioRef.current) {
        gsap.fromTo(
          bioRef.current,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: bioRef.current,
              start: "top 95%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      }

      // Teacher bios — same scrub as founder bio
      gsap.utils.toArray<HTMLElement>(".teacher-bio").forEach((el) => {
        if (el.offsetParent === null) return;
        gsap.fromTo(
          el,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      });

      }

      if (!cheap) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    }, rootRef);

    return () => {
      cssCleanup?.();
      ctx.revert();
    };
  }, [ready]);

  return (
    <main
      id="main-content"
      ref={rootRef}
      className={`studio-page relative z-10 ${surface}`}
      data-studio-root
    >
      {/* Hero */}
      <section
        className={`pointer-events-none relative z-10 flex min-h-screen w-full flex-col items-start overflow-visible px-5 pt-[120px] md:px-6.5 ${surface}`}
      >
        <div className="relative flex w-full flex-col items-start justify-between overflow-visible md:flex-row">
          <div className="relative mb-20 flex flex-col">
            <h1
              ref={titleRef}
              className="pointer-events-auto overflow-hidden text-[clamp(5rem,20vw,10rem)] leading-none font-medium md:text-[clamp(10rem,15vw,15rem)]"
            >
              {HERO_TITLE}
            </h1>
            <p className="lml-found pointer-events-auto mt-[-4%] text-[clamp(1rem,6vw,3rem)] leading-none font-medium">
              {HERO_SUBTITLE}
            </p>
          </div>

          <div
            ref={portraitRef}
            className={`lml-portrait relative z-[5] w-full will-change-transform select-none md:w-[40%] ${portraitWell}`}
          >
            <PortraitCanvas theme={theme} />
          </div>
        </div>

        <div
          className={`lml-about-blend pointer-events-auto relative z-20 mt-[150px] w-full ${
            isLight ? "mix-blend-difference text-white" : ""
          }`}
        >
          {/* md:absolute — sits on the text block origin like LML, not above it in flow */}
          <span
            className={`lml-about-pill mb-3 mt-3 block w-fit rounded-full border px-6.5 py-1 text-xs md:absolute md:top-0 md:left-0 md:z-[1] md:mt-3 md:mb-0 md:flex md:items-center md:justify-center md:text-sm ${aboutPill}`}
          >
            About
          </span>
          <div className="scroll-float">
            <ScrollFloat
              ready={ready}
              scrollStart="top 75%"
              scrollEnd="top 20%"
              stagger={0.03}
              className="font-swiss w-full text-left text-[1.75rem] leading-[1.2] md:text-[2.5rem]"
            >
              <span className="inline-block whitespace-nowrap" style={{ marginLeft: "35vw" }}>
                {ABOUT_NAME.replace(/ /g, "\u00a0")}
              </span>{" "}
              {ABOUT_BLURB}
            </ScrollFloat>
          </div>
        </div>

        {/* Mobile: empty well the portrait travels into, so the tagline sits below it. */}
        <div
          ref={landingRef}
          className="pointer-events-none relative z-0 mt-4 aspect-square w-full shrink-0 md:hidden"
          aria-hidden
        />
      </section>

      {/* Tagline — desktop portrait scrub still centers here (LML pattern) */}
      <section
        ref={taglineRef}
        className="pointer-events-none relative z-20 flex w-full items-start px-5 pt-8 md:h-[80vh] md:items-center md:px-6.5 md:pt-[200px]"
      >
        <div className="scroll-float w-full">
          <ScrollFloat
            ready={ready}
            scrollStart="top 90%"
            scrollEnd="top 25%"
            stagger={0.03}
            className="pointer-events-auto w-full whitespace-pre-wrap text-[2rem] leading-none font-medium md:text-[5vw]"
          >
            {TAGLINE_LINES[0]}
            <br />
            {TAGLINE_LINES[1]}
            <br />
            {TAGLINE_LINES[2]}
          </ScrollFloat>
        </div>
      </section>

      {/* Bio — transparent bg so descending portrait isn’t covered */}
      <section className="pointer-events-none relative z-10 flex h-auto w-full flex-col items-end px-5 pb-[140px] md:px-6.5 md:pb-[280px]">
        <div className="flex w-full max-w-full flex-row justify-end md:w-[40%]">
          <span
            ref={bioRef}
            className="pointer-events-auto w-full whitespace-pre-wrap text-left text-[1rem] leading-[1.4] md:text-[1.375rem]"
          >
            {BIO}
          </span>
        </div>
      </section>

      {/* Secondary teachers — Yuliia left, Tatiana mirrored right; viewport-fit */}
      <section
        aria-label="Teaching team"
        className="pointer-events-none relative z-10 w-full pt-40 pb-[280px] md:pt-72 md:pb-[420px]"
      >
        <div className="pointer-events-auto flex w-full flex-col gap-36 px-5 md:gap-64 md:px-0">
          {TEAM.map((person, index) => {
            const mirror = index % 2 === 1;
            return (
              <article
                key={person.name}
                className={`team-chapter relative w-full font-swiss md:w-[min(55.2%,calc(85svh*1405/1495))] ${teamInk} ${
                  mirror ? "md:ml-auto md:mr-[18.6%]" : "md:ml-[18.6%]"
                }`}
              >
                {/* Desktop: Figma 1405×1495 — height capped to ~85svh */}
                <div className="relative hidden w-full md:block md:aspect-[1405/1495]">
                  <div
                    className={`absolute top-0 z-0 aspect-[989/1007] w-[70.4%] select-none ${
                      mirror ? "right-[21.6%]" : "left-[21.6%]"
                    }`}
                  >
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      unoptimized={person.photo.endsWith(".svg")}
                      draggable={false}
                      sizes="40vw"
                      className={`object-contain object-top select-none swiss-no-select ${
                        mirror ? "object-right" : "object-left"
                      }`}
                    />
                  </div>

                  <div
                    className={`absolute top-[8%] z-10 flex w-[78%] flex-col ${
                      mirror
                        ? "right-0 items-end text-right"
                        : "left-0 items-start text-left"
                    }`}
                  >
                    <ScrollFloat
                      ready={ready}
                      as="h2"
                      scrollStart="top 80%"
                      scrollEnd="top 30%"
                      stagger={0.03}
                      className="text-[clamp(2rem,4.2vw,5.75rem)] leading-[1.05] font-normal tracking-tight"
                    >
                      {person.name}
                    </ScrollFloat>
                    <ScrollFloat
                      ready={ready}
                      as="p"
                      scrollStart="top 80%"
                      scrollEnd="top 30%"
                      stagger={0.03}
                      className={`mt-1 text-[clamp(2rem,4.2vw,5.75rem)] leading-[1.05] font-normal tracking-tight ${
                        mirror
                          ? "pr-[min(11%,3.5rem)]"
                          : "pl-[min(11%,3.5rem)]"
                      }`}
                    >
                      {person.role}
                    </ScrollFloat>
                  </div>

                  <p
                    className={`teacher-bio absolute top-[62.9%] z-10 w-[82.8%] whitespace-pre-wrap text-[clamp(0.9rem,1.1vw,1.5rem)] leading-normal font-normal ${
                      mirror
                        ? "right-[17.2%] text-right"
                        : "left-[17.2%] text-left"
                    }`}
                  >
                    {person.line}
                  </p>
                </div>

                {/* Mobile */}
                <div
                  className={`flex w-full flex-col md:hidden ${
                    mirror ? "items-end text-right" : "items-start text-left"
                  }`}
                >
                  <ScrollFloat
                    ready={ready}
                    as="h2"
                    scrollStart="top 85%"
                    scrollEnd="top 40%"
                    stagger={0.03}
                    className="text-[clamp(2.25rem,9vw,3rem)] leading-[1.05] font-normal tracking-tight"
                  >
                    {person.name}
                  </ScrollFloat>
                  <ScrollFloat
                    ready={ready}
                    as="p"
                    scrollStart="top 85%"
                    scrollEnd="top 40%"
                    stagger={0.03}
                    className="mt-1 text-[clamp(2.25rem,9vw,3rem)] leading-[1.05] font-normal tracking-tight"
                  >
                    {person.role}
                  </ScrollFloat>
                  <div className="relative mt-8 aspect-[989/1007] w-full select-none">
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      unoptimized={person.photo.endsWith(".svg")}
                      draggable={false}
                      sizes="90vw"
                      className="object-contain object-top select-none swiss-no-select"
                    />
                  </div>
                  <p className="teacher-bio mt-10 whitespace-pre-wrap text-[1rem] leading-[1.4] font-normal">
                    {person.line}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

type LmlStudioPageProps = {
  /**
   * `lab` — isolated StudioHeader (LML + Work / Studio).
   * `site` — no lab header; global Navbar owns CDF + Contact / Menu chrome.
   */
  chrome?: "lab" | "site";
  /** Dark = production staff; light = Staff-2 experiment. */
  theme?: "dark" | "light";
};

export function LmlStudioPage({
  chrome = "lab",
  theme = "dark",
}: LmlStudioPageProps) {
  const useSiteChrome = chrome === "site";
  const isLight = theme === "light";

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      const hadDark = root.classList.contains("dark");
      if (hadDark) root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.style.backgroundColor = "#fff";
      document.body.style.backgroundColor = "#fff";
      return () => {
        if (hadDark) root.classList.add("dark");
        root.style.colorScheme = "";
        root.style.backgroundColor = "";
        document.body.style.backgroundColor = "";
      };
    }

    // Keep lab visually dark even if root ThemeProvider is light.
    const addedDark = !root.classList.contains("dark");
    if (addedDark) root.classList.add("dark");
    root.style.colorScheme = "dark";
    root.style.backgroundColor = "#000";
    document.body.style.backgroundColor = "#000";
    return () => {
      if (addedDark) root.classList.remove("dark");
      root.style.colorScheme = "";
      root.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, [isLight]);

  return (
    <LabScrollProvider>
      <div
        className={`relative min-h-screen ${
          isLight ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        {useSiteChrome ? null : <StudioHeader />}
        <div className="fixed top-0 right-0 left-0 z-[1000] h-[100px] md:h-[120px]" />
        <StudioContent ready theme={theme} />
        {/* Site chrome: sticky meta is global via SiteShell SiteStatusBar */}
        <StudioFooterBar
          showContactCta={!useSiteChrome}
          showStatusBar={!useSiteChrome}
        />
        <NoiseOverlay />
        <CustomScrollbar />
      </div>
    </LabScrollProvider>
  );
}

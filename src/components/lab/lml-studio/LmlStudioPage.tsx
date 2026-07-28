"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { GuidePath } from "./GuidePath";
import { LabScrollProvider } from "./LabScrollProvider";
import { NoiseOverlay } from "./NoiseOverlay";
import { PortraitCanvas } from "./PortraitCanvas";
import { ScrollFloat } from "./ScrollFloat";
import { StudioFooterBar } from "./StudioFooterBar";
import { StudioHeader } from "./StudioHeader";
// StudioLoader kept for a future intro polish — flip ENABLE_STUDIO_LOADER to restore.
import { StudioLoader } from "./StudioLoader";

/** Set true to bring back the staff/lab studio intro loader. */
const ENABLE_STUDIO_LOADER = false;

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

function StudioContent({ ready }: { ready: boolean }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLSpanElement>(null);
  const guideRegionRef = useRef<HTMLDivElement>(null);
  const visionaryYRef = useRef<HTMLSpanElement>(null);
  const yuliiaGuideRef = useRef<HTMLSpanElement>(null);
  const tatianaGuideRef = useRef<HTMLSpanElement>(null);
  const footerGuideRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ready) return;

    const ctx = gsap.context(() => {
      const splits: SplitType[] = [];

      // Hero title — load entrance (not scrubbed on LML)
      if (titleRef.current) {
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
      }

      gsap.from(".lml-found", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.45,
      });

      // Portrait entrance: opacity only (scroll owns Y motion)
      gsap.from(".lml-portrait", {
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.25,
      });

      /**
       * Portrait scroll travel — matches lml.cc studio page source:
       * y ends when portrait center == tagline center; scrub ends when
       * tagline center hits viewport center. Desktop scrub 0.6 / touch 0.9.
       */
      if (portraitRef.current && taglineRef.current) {
        const portrait = portraitRef.current;
        const tagline = taglineRef.current;
        const touch =
          ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
          (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          ) ||
            window.innerWidth <= 1024);
        const scrub = touch ? 0.9 : 0.6;

        const getTravelY = () => {
          const portraitCenter =
            offsetTopSum(portrait) + portrait.offsetHeight / 2;
          const taglineCenter =
            offsetTopSum(tagline) + tagline.offsetHeight / 2;
          return taglineCenter - portraitCenter;
        };

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
              start: () => "top top",
              end: () =>
                `${offsetTopSum(tagline) + tagline.offsetHeight / 2 - window.innerHeight / 2}px center`,
              scrub,
              invalidateOnRefresh: true,
            },
          },
        );
      }

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

      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      ctx.revert();
    };
  }, [ready]);

  return (
    <div className="studio-page relative z-10 bg-black" id="studio">
      {/* Hero */}
      <section className="pointer-events-none relative z-10 flex min-h-screen w-full flex-col items-start overflow-visible bg-black px-5 pt-[120px] md:px-6.5">
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
            className="lml-portrait relative z-[5] w-full bg-black will-change-transform select-none md:w-[40%]"
          >
            <PortraitCanvas />
          </div>
        </div>

        <div className="pointer-events-auto relative z-20 mt-[150px] w-full">
          {/* md:absolute — sits on the text block origin like LML, not above it in flow */}
          <span className="lml-about-pill mb-3 mt-3 block w-fit rounded-full border border-white/50 px-6.5 py-1 text-xs text-white/70 md:absolute md:top-0 md:left-0 md:z-[1] md:mt-3 md:mb-0 md:flex md:items-center md:justify-center md:text-sm">
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
      </section>

      {/* Tagline → teachers: shared space for the Visionary guide path */}
      <div ref={guideRegionRef} className="relative">
        <GuidePath
          ready={ready}
          regionRef={guideRegionRef}
          startRef={visionaryYRef}
          midRef={yuliiaGuideRef}
          endRef={tatianaGuideRef}
          footerRef={footerGuideRef}
        />

        {/* Tagline — portrait scrub centers on this block (LML pattern) */}
        <section
          ref={taglineRef}
          className="pointer-events-none relative z-20 flex min-h-[50vh] w-full items-center px-5 pt-[100px] md:h-[80vh] md:px-6.5 md:pt-[200px]"
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
              {TAGLINE_LINES[2].slice(
                0,
                TAGLINE_LINES[2].indexOf("Visionary"),
              )}
              Visionar
              <span
                ref={visionaryYRef}
                data-guide-anchor="visionary-y"
                className="inline-block"
              >
                y
              </span>
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
              const guideRef = index === 0 ? yuliiaGuideRef : tatianaGuideRef;
              return (
                <article
                  key={person.name}
                  className={`team-chapter relative w-full font-swiss text-white md:w-[min(55.2%,calc(85svh*1405/1495))] ${
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
                        draggable={false}
                        sizes="40vw"
                        className={`object-contain object-top select-none swiss-no-select ${
                          mirror ? "object-right" : "object-left"
                        }`}
                      />
                    </div>

                    <span
                      ref={guideRef}
                      data-guide-anchor={mirror ? "tatiana" : "yuliia"}
                      aria-hidden
                      className={`pointer-events-none absolute top-[8%] z-[5] h-0 w-0 ${
                        mirror ? "right-0" : "left-0"
                      }`}
                    />

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

        {/* Path terminus — line continues through padding into the site footer */}
        <span
          ref={footerGuideRef}
          data-guide-anchor="footer"
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 h-0 w-0"
        />
      </div>
    </div>
  );
}

type LmlStudioPageProps = {
  /**
   * `lab` — isolated StudioHeader (LML + Work / Studio).
   * `site` — no lab header; global Navbar owns CDF + Contact / Menu chrome.
   */
  chrome?: "lab" | "site";
};

export function LmlStudioPage({ chrome = "lab" }: LmlStudioPageProps) {
  const [loaderDone, setLoaderDone] = useState(!ENABLE_STUDIO_LOADER);
  const [contentReady, setContentReady] = useState(!ENABLE_STUDIO_LOADER);
  const useSiteChrome = chrome === "site";

  const handleLoaderDone = useCallback(() => {
    setLoaderDone(true);
    // Allow one frame for content to paint before kicking entrance GSAP.
    requestAnimationFrame(() => setContentReady(true));
  }, []);

  useEffect(() => {
    // Keep lab visually dark even if root ThemeProvider is light.
    const root = document.documentElement;
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
  }, []);

  useEffect(() => {
    if (!ENABLE_STUDIO_LOADER) return;
    if (loaderDone) {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
      return;
    }
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    };
  }, [loaderDone]);

  return (
    <LabScrollProvider>
      <div className="relative min-h-screen bg-black text-white">
        {ENABLE_STUDIO_LOADER && !loaderDone ? (
          <StudioLoader onDone={handleLoaderDone} />
        ) : null}
        <div
          className={loaderDone ? "opacity-100" : "opacity-0"}
          style={{ visibility: loaderDone ? "visible" : "hidden" }}
        >
          {useSiteChrome ? null : <StudioHeader />}
          <div className="fixed top-0 right-0 left-0 z-[1000] h-[100px] md:h-[120px]" />
          <StudioContent ready={contentReady} />
          {/* Site chrome: sticky meta is global via LabShell SiteStatusBar */}
          <StudioFooterBar
            showContactCta={!useSiteChrome}
            showStatusBar={!useSiteChrome}
          />
          <NoiseOverlay />
          <CustomScrollbar />
        </div>
      </div>
    </LabScrollProvider>
  );
}

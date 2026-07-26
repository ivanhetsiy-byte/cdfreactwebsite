"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
} from "react";

import {
  HOME_LOCKED_MOTTO,
  useLanguage,
} from "@/context/LanguageContext";
import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";
import { ScrollSlide } from "@/components/motion/ScrollSlide";

gsap.registerPlugin(ScrollTrigger);

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

const GALLERY_PLACEHOLDERS = [
  "/images/gallery/placeholder-01.svg",
  "/images/gallery/placeholder-02.svg",
  "/images/gallery/placeholder-03.svg",
  "/images/gallery/placeholder-04.svg",
  "/images/gallery/placeholder-05.svg",
  "/images/gallery/placeholder-06.svg",
] as const;

const GALLERY_CAPTIONS = [
  "Nationals — Stage A",
  "Studio — Rehearsal Week",
  "Regionals — Finals",
  "Convention — Showcase",
  "Season 12 — Team",
  "Awards — Closing Night",
  "Open — Contemporary",
  "Jazz — Ensemble",
  "Ballet — Variations",
  "Acro — Elite",
  "Workshop — Guest Artist",
  "Tour — City Night",
  "Backstage — Warmup",
  "Competition — Day Two",
  "Finale — Curtain Call",
] as const;

const GALLERY_ITEMS: GalleryItem[] = GALLERY_CAPTIONS.map((caption, i) => ({
  id: String(i + 1).padStart(2, "0"),
  src: GALLERY_PLACEHOLDERS[i % GALLERY_PLACEHOLDERS.length]!,
  alt: `${caption} placeholder`,
  caption,
}));

function GalleryFigure({ item }: { item: GalleryItem }) {
  return (
    <figure className="group relative h-full w-full overflow-hidden bg-black">
      <Image
        src={item.src}
        alt={item.alt}
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 42vw"
        className="object-cover grayscale group-hover:grayscale-0"
      />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-4 py-5 opacity-100 md:px-5 md:py-6">
        <p className="font-swiss text-xs font-medium tracking-[0.2em] text-white uppercase md:text-sm">
          {item.caption}
        </p>
      </figcaption>
    </figure>
  );
}

function GalleryStrip() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const momentumRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0); // px/ms, scroll direction
  const smoothVelRef = useRef(0);

  const stopMomentum = useCallback(() => {
    if (momentumRef.current != null) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  }, []);

  const clampScroll = (el: HTMLDivElement, value: number) => {
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    return Math.min(max, Math.max(0, value));
  };

  const startMomentum = useCallback(
    (releaseVelocity: number) => {
      const el = scrollerRef.current;
      if (!el) return;

      stopMomentum();

      if (Math.abs(releaseVelocity) < 0.04) {
        velocityRef.current = 0;
        smoothVelRef.current = 0;
        return;
      }

      // Gentler release coast.
      let velocity = releaseVelocity * 0.6375;
      const decayTau = 420; // ms — fades a bit sooner
      let last = performance.now();

      const tick = (now: number) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const dt = Math.min(32, now - last);
        last = now;

        velocity *= Math.exp(-dt / decayTau);

        const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        const next = Math.min(
          max,
          Math.max(0, scroller.scrollLeft + velocity * dt),
        );
        scroller.scrollLeft = next;

        const atEdge =
          (velocity < 0 && next <= 0) || (velocity > 0 && next >= max);

        if (atEdge || Math.abs(velocity) < 0.025) {
          momentumRef.current = null;
          velocityRef.current = 0;
          smoothVelRef.current = 0;
          return;
        }

        momentumRef.current = requestAnimationFrame(tick);
      };

      momentumRef.current = requestAnimationFrame(tick);
    },
    [stopMomentum],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Touch devices use native momentum scrolling; the custom drag is
    // only needed for mouse input, which can't drag-scroll natively.
    if (e.pointerType !== "mouse") return;
    if (e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;

    stopMomentum();
    draggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    velocityRef.current = 0;
    smoothVelRef.current = 0;

    el.setPointerCapture(e.pointerId);
    el.classList.add("cursor-grabbing");
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastTRef.current);
    const dx = e.clientX - lastXRef.current;
    const dragScale = 0.54; // slower than 1:1 pointer tracking
    const scrollDx = dx * dragScale;

    // Drag left → content moves left (increase scrollLeft).
    const rawVelocity = -scrollDx / dt; // px/ms in scroll space

    // Exponential ease-in of tracked velocity while dragging.
    const blend = 1 - Math.exp(-dt / 55);
    smoothVelRef.current += (rawVelocity - smoothVelRef.current) * blend;
    velocityRef.current = smoothVelRef.current;

    el.scrollLeft = clampScroll(el, el.scrollLeft - scrollDx);

    lastXRef.current = e.clientX;
    lastTRef.current = now;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;

    draggingRef.current = false;
    pointerIdRef.current = null;

    const el = scrollerRef.current;
    el?.classList.remove("cursor-grabbing");
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }

    startMomentum(velocityRef.current);
  };

  useEffect(() => () => stopMomentum(), [stopMomentum]);

  return (
    <div
      ref={scrollerRef}
      role="region"
      aria-label="Image gallery"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="-mx-6 flex cursor-grab gap-0 overflow-x-auto overscroll-x-contain no-scrollbar select-none active:cursor-grabbing md:-mx-10"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {GALLERY_ITEMS.map((item) => (
        <div
          key={item.id}
          className="w-[calc(100vw-3rem)] shrink-0 px-6 md:w-[min(28rem,42vw)] md:px-5"
        >
          <div className="pointer-events-none aspect-[3/4] w-full">
            <GalleryFigure item={item} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeWireframes() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const programsBandRef = useRef<HTMLDivElement>(null);
  const programsWashRef = useRef<HTMLDivElement>(null);
  const mottoSectionRef = useRef<HTMLElement>(null);

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) return;
    if (navLockRef.current) return;

    navLockRef.current = true;

    if (targetPath === "/") {
      sessionStorage.setItem("fromSubpage", "true");
    }

    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, ROUTE_COVER_MS);
  };

  const mottoLine1 = HOME_LOCKED_MOTTO.line1.replace(/[.,]$/, "");
  const mottoLine2 = HOME_LOCKED_MOTTO.line2.replace(/[.,]$/, "");

  /**
   * Wilian-style chapter wash: fixed full-viewport black, opacity scrubbed
   * across enter/exit whitespace runways so the shift feels gradual.
   */
  useEffect(() => {
    const band = programsBandRef.current;
    const wash = programsWashRef.current;
    if (!band || !wash) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDark = document.documentElement.classList.contains("dark");

    const setLightInk = () => {
      band.style.setProperty("--programs-title", "#ffffff");
      band.style.setProperty("--programs-body", "#a3a3a3");
      band.style.setProperty("--programs-rail", "#ffffff");
    };

    const setDarkInk = () => {
      band.style.setProperty("--programs-title", "#000000");
      band.style.setProperty("--programs-body", "#6b6b6b");
      band.style.setProperty("--programs-rail", "#000000");
    };

    const setRedSelection = (on: boolean) => {
      if (on) {
        band.setAttribute("data-selection-dark", "");
        document.documentElement.classList.add("cdf-red-selection");
      } else {
        band.removeAttribute("data-selection-dark");
        document.documentElement.classList.remove("cdf-red-selection");
      }
    };

    const clearRedSelection = () => {
      band.removeAttribute("data-selection-dark");
      document.documentElement.classList.remove("cdf-red-selection");
    };

    if (reduced) {
      gsap.set(wash, { opacity: 1 });
      setLightInk();
      setRedSelection(true);
      return () => clearRedSelection();
    }

    if (isDark) setLightInk();

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const inkFromWash = (opacity: number) => {
      setRedSelection(opacity >= 0.45);
      if (isDark) {
        setLightInk();
        return;
      }
      const t = Math.min(1, Math.max(0, (opacity - 0.15) / 0.55));
      const ink = Math.round(lerp(0, 255, t));
      const muted = Math.round(lerp(0x6b, 0xa3, t));
      band.style.setProperty(
        "--programs-title",
        `rgb(${ink}, ${ink}, ${ink})`,
      );
      band.style.setProperty(
        "--programs-body",
        `rgb(${muted}, ${muted}, ${muted})`,
      );
      band.style.setProperty(
        "--programs-rail",
        `rgb(${ink}, ${ink}, ${ink})`,
      );
    };

    const ctx = gsap.context(() => {
      gsap.set(wash, { opacity: 0 });
      if (!isDark) setDarkInk();

      // One timeline over the whole chapter (enter runway → content → exit).
      // Fade-in spans the tall enter whitespace; fade-out the exit runway.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: band,
          start: "top 65%",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: () => {
            inkFromWash(Number(gsap.getProperty(wash, "opacity")));
          },
        },
      });

      tl.fromTo(
        wash,
        { opacity: 0 },
        { opacity: 1, duration: 0.34, ease: "none" },
        0,
      );
      tl.to(wash, { opacity: 1, duration: 0.42, ease: "none" }, 0.34);
      tl.to(wash, { opacity: 0, duration: 0.24, ease: "none" }, 0.76);
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      clearRedSelection();
      ctx.revert();
    };
  }, []);

  return (
    <div className="relative z-[1] w-full text-black dark:text-white">
      {/* Fixed viewport wash — under content, above page canvas (Wilian). */}
      <div
        ref={programsWashRef}
        aria-hidden="true"
        data-programs-wash
        className="pointer-events-none fixed inset-0 z-0 bg-black opacity-0"
      />

      <div className="relative z-[1]">
      {/* ── Motto — opposite-side slides; play on enter, reverse on scroll-up ── */}
      <section
        ref={mottoSectionRef}
        aria-labelledby="home-motto-heading"
        className="relative flex min-h-dvh w-full items-center overflow-x-clip py-28 md:block md:min-h-0 md:pt-[20vw] md:pb-[14.5vw]"
      >
        <h2
          id="home-motto-heading"
          className="font-swiss text-[clamp(1.85rem,8vw,3rem)] font-bold uppercase leading-[0.8] tracking-tighter md:text-[8.55vw]"
        >
          <ScrollSlide
            from="left"
            as="span"
            className="block whitespace-nowrap"
            scrub={false}
            duration={1.25}
            ease="power3.out"
            scrollStart="top 78%"
            triggerRef={mottoSectionRef}
          >
            {mottoLine1}
          </ScrollSlide>
          <ScrollSlide
            from="right"
            as="span"
            className="mt-[0.08em] block whitespace-nowrap pl-[1.4em]"
            scrub={false}
            duration={1.25}
            ease="power3.out"
            scrollStart="top 78%"
            triggerRef={mottoSectionRef}
            distancePercent={50}
          >
            {mottoLine2}
          </ScrollSlide>
        </h2>
      </section>

      {/* ── Programs ── */}
      <section
        aria-labelledby="home-programs-heading"
        className="relative w-full pb-24 md:pt-[14.5vw] md:pb-[10vw]"
      >
        {/* Header: Ages 3–16 + body / CTA — stays on page canvas */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <h2
            id="home-programs-heading"
            className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold leading-[0.92] tracking-tight md:text-[13.4vw]"
          >
            {t.home.programs.headline}
          </h2>

          <div className="flex max-w-[28rem] shrink-0 gap-5 md:max-w-[32rem] md:pt-[1.5vw]">
            <span
              aria-hidden="true"
              className="mt-1 hidden h-[11rem] w-px shrink-0 bg-black dark:bg-white md:block"
            />
            <div className="flex flex-col gap-4 border-t border-black/20 pt-5 dark:border-white/20 md:border-t-0 md:pt-0">
              <p className="font-alt text-[clamp(1.125rem,1.8vw,1.75rem)] leading-[1.45] tracking-tight text-[#6b6b6b]">
                {t.home.programs.body}
              </p>
              <Link
                href="/classes"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelayedNavigation("/classes");
                }}
                className="inline-flex w-fit font-swiss text-[clamp(1rem,1.6vw,1.5rem)] font-bold leading-[1.45] uppercase tracking-tight text-[#616161] transition-colors duration-150 hover:text-black dark:hover:text-white"
              >
                {t.home.programs.cta}
              </Link>
            </div>
          </div>
        </div>

        {/* Competitive / Recreational chapter */}
        <div
          ref={programsBandRef}
          className="programs-band relative mt-24 w-full select-text md:mt-[12vw]"
        >
          {/* Enter runway — scroll into black before the type */}
          <div className="h-[60vh] md:h-[85vh]" aria-hidden="true" />

          <div className="relative pb-8 md:pb-[10vw]">
            <div
              aria-hidden="true"
              className="programs-band-rail pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 md:block"
            />

            <ul className="flex flex-col gap-24 md:gap-0">
              <li className="relative md:w-[48%] md:pr-8">
                <p className="programs-band-title font-swiss text-[clamp(2.5rem,8vw,3.5rem)] font-bold leading-none tracking-tighter md:text-[7vw]">
                  {t.home.programs.competitive.name}
                </p>
                <p className="programs-band-body mt-5 max-w-[34rem] font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.5] tracking-tight md:mt-7">
                  {t.home.programs.competitive.line}
                </p>
              </li>

              <li className="relative md:mt-[25vw] md:ml-auto md:w-[48%] md:pl-8">
                <p className="programs-band-title font-swiss text-[clamp(2.5rem,8vw,3.5rem)] font-bold leading-none tracking-tighter md:text-[7vw]">
                  {t.home.programs.recreational.name}
                </p>
                <p className="programs-band-body mt-5 max-w-[34rem] font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.5] tracking-tight md:mt-7">
                  {t.home.programs.recreational.line}
                </p>
              </li>
            </ul>
          </div>

          {/* Exit runway — ease back out toward gallery */}
          <div className="h-[45vh] md:h-[60vh]" aria-hidden="true" />
        </div>
      </section>

      {/* ── Gallery ── */}
      <section
        aria-labelledby="home-gallery-heading"
        className="relative w-full"
      >
        <div className="relative pb-8 md:pb-8">
          <h2
            id="home-gallery-heading"
            className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[11.5vw]"
          >
            {t.home.gallery.label}
          </h2>
          <div
            aria-hidden="true"
            className="mt-2 h-[3px] w-full bg-black dark:bg-white"
          />
        </div>

        <div className="pb-20 md:pb-12">
          <GalleryStrip />
        </div>
      </section>
      </div>
    </div>
  );
}

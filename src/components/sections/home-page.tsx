"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
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
import { ScrollSlide } from "@/components/motion/ScrollSlide";

gsap.registerPlugin(ScrollTrigger);

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "01",
    src: "/images/gallery/wdc-2026-leap.jpg",
    alt: "CDF dancers at WDC 2026 performing Venom Grace",
    caption: "WDC 2026 — Venom Grace",
  },
  {
    id: "02",
    src: "/images/gallery/wdc-2026-ensemble.jpg",
    alt: "CDF dancers at WDC 2026 performing Venom Grace",
    caption: "WDC 2026 — Venom Grace",
  },
  {
    id: "03",
    src: "/images/gallery/nexstar-2026.jpg",
    alt: "CDF dancers at Nexstar 2026 performing Hey!",
    caption: "NEXSTAR 2026 — Hey!",
  },
];

function GalleryFigure({ item }: { item: GalleryItem }) {
  return (
    <figure
      data-gallery-figure
      className="relative h-full w-full overflow-hidden bg-black"
    >
      <Image
        data-gallery-image
        src={item.src}
        alt={item.alt}
        fill
        unoptimized={item.src.endsWith(".svg")}
        sizes="(max-width: 768px) 100vw, 42vw"
        className="object-cover will-change-[filter] motion-reduce:grayscale-0"
        style={{ filter: "grayscale(1) brightness(0.88)" }}
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

  // Grayscale → color as each slide enters view (page scroll or horizontal drag).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const figures = scroller.querySelectorAll<HTMLElement>("[data-gallery-figure]");
    if (!figures.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      scroller.querySelectorAll<HTMLElement>("[data-gallery-image]").forEach((img) => {
        gsap.set(img, { filter: "grayscale(0) brightness(1)" });
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const img = entry.target.querySelector<HTMLElement>("[data-gallery-image]");
          if (!img) continue;

          const amount = Math.min(1, Math.max(0, entry.intersectionRatio));
          // Ease the last stretch so color "glows" in once mostly visible.
          const t = amount * amount * (3 - 2 * amount); // smoothstep
          gsap.to(img, {
            filter: `grayscale(${1 - t}) brightness(${0.88 + 0.12 * t})`,
            duration: 0.55,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      },
      {
        threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
        rootMargin: "0px -6% 0px -6%",
      },
    );

    figures.forEach((figure) => observer.observe(figure));

    return () => observer.disconnect();
  }, []);

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
  const mottoSectionRef = useRef<HTMLElement>(null);
  const mottoWipeRef = useRef<HTMLDivElement>(null);

  const mottoLine1 = HOME_LOCKED_MOTTO.line1.replace(/[.,]$/, "");
  const mottoLine2 = HOME_LOCKED_MOTTO.line2.replace(/[.,]$/, "");

  // Left→right black wipe; white text + mix-blend-difference inverts over it.
  useEffect(() => {
    const section = mottoSectionRef.current;
    const wipe = mottoWipeRef.current;
    if (!section || !wipe) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wipe,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "center 45%",
            scrub: true,
          },
        },
      );
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-[1] w-full text-black dark:text-white">
      {/* ── Motto — opposite-side slides + L→R black wipe that inverts the type ── */}
      <section
        ref={mottoSectionRef}
        aria-labelledby="home-motto-heading"
        className="relative isolate -mx-6 flex min-h-dvh w-[calc(100%+3rem)] items-center overflow-hidden bg-white px-6 pt-28 pb-40 md:-mx-10 md:block md:min-h-0 md:w-[calc(100%+5rem)] md:px-10 md:pt-[20vw] md:pb-[24vw]"
      >
        <div
          ref={mottoWipeRef}
          aria-hidden
          data-nav-page-surface="dark"
          className="pointer-events-none absolute inset-0 z-0 bg-black"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        />
        <h2
          id="home-motto-heading"
          className="relative z-10 font-swiss text-[clamp(1.85rem,8vw,3rem)] font-bold uppercase leading-[0.8] tracking-tighter text-white mix-blend-difference md:text-[8.55vw]"
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

      {/* Programs + Gallery */}
      <div className="relative w-full">
        {/* ── Programs — Ages headline, Competitive → Recreational ── */}
        <section
          aria-labelledby="home-programs-ages"
          className="relative w-full pt-24 md:pt-[12vw]"
        >
          <h2
            id="home-programs-ages"
            className="relative z-10 font-swiss text-[clamp(3rem,13.93vw,21.3rem)] font-bold leading-[0.92] tracking-[-0.025em]"
          >
            {t.home.programs.headline}
          </h2>

          {/* Mobile layout — stacked program copy */}
          <div className="relative mt-10 w-full pb-36 md:hidden">
            <article
              aria-labelledby="home-program-competitive-mobile"
              className="relative z-10 mt-16 w-full"
            >
              <ScrollSlide
                from="up"
                as="div"
                distancePercent={12}
                scrollStart="top 88%"
                scrollEnd="top 55%"
              >
                <h3
                  id="home-program-competitive-mobile"
                  className="font-swiss text-[clamp(2.75rem,8.58vw,13.1rem)] font-bold leading-[0.9] tracking-tighter"
                >
                  {t.home.programs.competitive.name}
                </h3>
                <p className="mt-8 max-w-[32rem] font-alt text-[clamp(1rem,0.98vw,1.5rem)] leading-[1.54] tracking-tight text-[#1a1a1a] dark:text-[#f2f2f2]">
                  {t.home.programs.competitive.line}
                </p>
              </ScrollSlide>
            </article>

            <article
              aria-labelledby="home-program-recreational-mobile"
              className="relative z-10 mt-36 w-full text-right"
            >
              <ScrollSlide
                from="up"
                as="div"
                distancePercent={12}
                scrollStart="top 88%"
                scrollEnd="top 55%"
              >
                <h3
                  id="home-program-recreational-mobile"
                  className="font-swiss text-[clamp(2.75rem,8.58vw,13.1rem)] font-bold leading-[0.9] tracking-tighter"
                >
                  {t.home.programs.recreational.name}
                </h3>
                <p className="mt-8 ml-auto max-w-[32rem] font-alt text-[clamp(1rem,0.98vw,1.5rem)] leading-[1.54] tracking-tight text-[#1a1a1a] dark:text-[#f2f2f2]">
                  {t.home.programs.recreational.line}
                </p>
              </ScrollSlide>
            </article>
          </div>

          {/* Desktop — Competitive / Recreational copy */}
          <div className="relative mt-6 hidden w-full md:mt-0 md:block md:aspect-[2448/3456]">
            <article
              aria-labelledby="home-program-competitive"
              className="relative z-10 mt-10 w-full md:absolute md:top-[19.8%] md:left-[2.65%] md:mt-0"
            >
              <ScrollSlide
                from="up"
                as="div"
                distancePercent={12}
                scrollStart="top 88%"
                scrollEnd="top 55%"
              >
                <h3
                  id="home-program-competitive"
                  className="font-swiss text-[clamp(2.75rem,8.58vw,13.1rem)] font-bold leading-[0.9] tracking-tighter"
                >
                  {t.home.programs.competitive.name}
                </h3>
                <p className="mt-6 max-w-[32rem] font-alt text-[clamp(1rem,0.98vw,1.5rem)] leading-[1.54] tracking-tight text-[#1a1a1a] md:mt-8 md:w-[20vw] md:max-w-none dark:text-[#f2f2f2]">
                  {t.home.programs.competitive.line}
                </p>
              </ScrollSlide>
            </article>

            <article
              aria-labelledby="home-program-recreational"
              className="relative z-10 mt-10 w-full md:absolute md:top-[52%] md:right-0 md:mt-0 md:text-right"
            >
              <ScrollSlide
                from="up"
                as="div"
                distancePercent={12}
                scrollStart="top 88%"
                scrollEnd="top 55%"
              >
                <h3
                  id="home-program-recreational"
                  className="font-swiss text-[clamp(2.75rem,8.58vw,13.1rem)] font-bold leading-[0.9] tracking-tighter"
                >
                  {t.home.programs.recreational.name}
                </h3>
                <p className="mt-6 max-w-[32rem] font-alt text-[clamp(1rem,0.98vw,1.5rem)] leading-[1.54] tracking-tight text-[#1a1a1a] md:mt-8 md:ml-auto md:w-[20vw] dark:text-[#f2f2f2]">
                  {t.home.programs.recreational.line}
                </p>
              </ScrollSlide>
            </article>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section
          aria-labelledby="home-gallery-heading"
          className="relative w-full pt-24 md:pt-[10vw]"
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

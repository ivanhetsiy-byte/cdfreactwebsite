"use client";

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
import { ProgramsGuidePath } from "@/components/motion/ProgramsGuidePath";
import { GuidePhoto } from "@/components/motion/GuidePhoto";

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
  const mottoSectionRef = useRef<HTMLElement>(null);

  const mottoLine1 = HOME_LOCKED_MOTTO.line1.replace(/[.,]$/, "");
  const mottoLine2 = HOME_LOCKED_MOTTO.line2.replace(/[.,]$/, "");

  return (
    <div className="relative z-[1] w-full text-black dark:text-white">
      {/* ── Motto — opposite-side slides; play on enter, reverse on scroll-up ── */}
      <section
        ref={mottoSectionRef}
        aria-labelledby="home-motto-heading"
        className="relative flex min-h-dvh w-full items-center overflow-x-clip pt-28 pb-40 md:block md:min-h-0 md:pt-[20vw] md:pb-[24vw]"
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

      {/* Programs + Gallery */}
      <div className="relative w-full">
        {/* ── Programs — Ages headline, winding line, Competitive → Recreational ── */}
        <section
          aria-labelledby="home-programs-ages"
          className="relative w-full"
        >
          <h2
            id="home-programs-ages"
            className="relative z-10 font-swiss text-[clamp(3rem,13.93vw,21.3rem)] font-bold leading-[0.92] tracking-[-0.025em]"
          >
            {t.home.programs.headline}
          </h2>

          {/* Mobile layout — stacked photos, guide line, and program copy */}
          <div className="relative mt-10 w-full pt-20 pb-36 md:hidden">
            <ProgramsGuidePath showOnMobile />

            <div className="relative z-10 pt-32">
              <div className="relative aspect-[3/4] w-[28vw] overflow-hidden">
                <Image
                  src="/images/classes/ballet.jpg"
                  alt="Ballet class in the studio"
                  fill
                  sizes="28vw"
                  className="object-cover"
                  quality={80}
                />
              </div>
            </div>

            <article
              aria-labelledby="home-program-competitive-mobile"
              className="relative z-10 mt-28 w-full"
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

            <div className="relative z-10 mt-36 flex justify-end">
              <div className="relative aspect-[3/4] w-[28vw] overflow-hidden">
                <Image
                  src="/images/classes/acrobatics.jpg"
                  alt="Acrobatics class in the studio"
                  fill
                  sizes="28vw"
                  className="object-cover"
                  quality={80}
                />
              </div>
            </div>

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

            <div className="relative z-10 mt-32">
              <div className="relative aspect-[3/4] w-[28vw] overflow-hidden">
                <Image
                  src="/images/mission-dancer.jpg"
                  alt="Dancer mid-movement"
                  fill
                  sizes="28vw"
                  className="object-cover"
                  quality={80}
                />
              </div>
            </div>
          </div>

          {/* Desktop canvas — coordinates below map to the 2448×3456 design region */}
          <div className="relative mt-6 hidden w-full md:mt-0 md:block md:aspect-[2448/3456]">
            <ProgramsGuidePath />

            {/* Photos at the rectangle positions along the line */}
            <GuidePhoto
              src="/images/classes/ballet.jpg"
              alt="Ballet class in the studio"
              className="md:absolute md:left-[37.3%] md:top-[6.3%] md:h-[6.7%] md:w-[6.6%]"
            />
            <GuidePhoto
              src="/images/classes/jazz.jpg"
              alt="Jazz class in the studio"
              className="md:absolute md:left-[32.2%] md:top-[30.8%] md:h-[6.7%] md:w-[6.6%]"
            />
            <GuidePhoto
              src="/images/classes/acrobatics.jpg"
              alt="Acrobatics class in the studio"
              className="md:absolute md:left-[63.6%] md:top-[44.8%] md:h-[6.7%] md:w-[6.6%]"
            />
            <GuidePhoto
              src="/images/classes/gymnastics.jpg"
              alt="Gymnastics class in the studio"
              className="md:absolute md:left-[7.5%] md:top-[58.7%] md:h-[10.6%] md:w-[14.9%]"
            />
            <GuidePhoto
              src="/images/mission-dancer.jpg"
              alt="Dancer mid-movement"
              className="md:absolute md:left-[79%] md:top-[71.4%] md:h-[12.2%] md:w-[11.6%]"
            />

            {/* Competitive — left of the line */}
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

            {/* Recreational — right of the line, flush right */}
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

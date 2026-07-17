"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";

import {
  HOME_LOCKED_MOTTO,
  HOME_LOCKED_SEASON,
  useLanguage,
} from "@/context/LanguageContext";
import { requestRouteCover } from "@/lib/route-cover";

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

function SectionIndex({ value }: { value: string }) {
  return (
    <span className="font-swiss text-xs font-medium tracking-[0.25em] text-[#666666] uppercase tabular-nums">
      {value}
    </span>
  );
}

function GalleryFigure({
  item,
  reducedMotion,
  alwaysShowCaption = false,
}: {
  item: GalleryItem;
  reducedMotion: boolean | null;
  alwaysShowCaption?: boolean;
}) {
  return (
    <figure className="group relative h-full w-full overflow-hidden bg-black">
      <Image
        src={item.src}
        alt={item.alt}
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 42vw"
        className={`object-cover transition-[filter] duration-300 ${
          reducedMotion
            ? "grayscale-0"
            : "grayscale group-hover:grayscale-0"
        }`}
      />
      <figcaption
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-4 py-5 md:px-5 md:py-6 ${
          alwaysShowCaption || reducedMotion
            ? "opacity-100"
            : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        }`}
      >
        <p className="font-swiss text-xs font-medium tracking-[0.2em] text-white uppercase md:text-sm">
          {item.caption}
        </p>
      </figcaption>
    </figure>
  );
}

function GalleryStrip({
  reducedMotion,
}: {
  reducedMotion: boolean | null;
}) {
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

      if (reducedMotion || Math.abs(releaseVelocity) < 0.04) {
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
    [reducedMotion, stopMomentum],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
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
      className="-mx-6 flex cursor-grab gap-0 overflow-x-auto overscroll-x-contain no-scrollbar touch-pan-y select-none active:cursor-grabbing md:-mx-10"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {GALLERY_ITEMS.map((item) => (
        <div
          key={item.id}
          data-gallery-slide
          className="w-[calc(100vw-3rem)] shrink-0 px-6 md:w-[min(28rem,42vw)] md:px-5"
        >
          <div className="pointer-events-none aspect-[3/4] w-full">
            <GalleryFigure
              item={item}
              reducedMotion={reducedMotion}
              alwaysShowCaption
            />
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
  const reducedMotion = useReducedMotion();

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
    }, 500);
  };

  const fadeUp = (delay = 0) =>
    reducedMotion
      ? { initial: false as const, whileInView: undefined, transition: undefined }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
          viewport: { once: true, amount: 0.25 },
        };

  const programKeys = ["competitive", "recreational"] as const;

  return (
    <div className="relative w-full bg-white text-black dark:bg-black dark:text-white swiss-no-select">
      {/* ── 01 Motto — Swiss cascade field ── */}
      <section
        aria-labelledby="home-motto-heading"
        className="relative -mx-6 flex min-h-[100dvh] w-[calc(100%+3rem)] flex-col justify-center overflow-hidden border-t-2 border-black px-6 dark:border-white md:-mx-10 md:w-[calc(100%+5rem)] md:px-10"
      >
        {/* Grid rails — desktop only */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-y-[8%] left-[8%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute inset-y-0 left-[28%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute inset-y-[12%] left-[58%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute inset-y-[20%] right-[10%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute top-[22%] left-[4%] hidden h-px w-[70%] bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute top-1/2 left-0 hidden h-px w-full bg-black/15 dark:bg-white/15 md:block" />
          <div className="absolute bottom-[24%] left-[18%] hidden h-px w-[78%] bg-black/10 dark:bg-white/10 md:block" />
        </div>

        {/* Vertical side index — desktop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[18%] left-6 hidden md:left-10 md:block"
        >
          <p className="-rotate-90 origin-bottom-left font-swiss text-xs font-medium tracking-[0.35em] text-[#666666] uppercase">
            {t.home.motto.index} — {t.home.motto.label}
          </p>
        </div>

        <div className="relative grid w-full grid-cols-1 gap-0 py-16 md:grid-cols-12 md:py-24">
          <motion.div
            className="mb-8 flex items-baseline gap-3 md:hidden"
            {...fadeUp(0)}
          >
            <SectionIndex value={t.home.motto.index} />
            <span className="font-swiss text-xs font-medium tracking-[0.2em] text-[#666666] uppercase">
              {t.home.motto.label}
            </span>
          </motion.div>

          <h2
            id="home-motto-heading"
            className="col-span-full flex flex-col font-swiss font-black uppercase tracking-tighter"
          >
            {/* Mobile: stacked cascade with soft indent */}
            <motion.span
              className="block text-[clamp(2.5rem,14vw,4.5rem)] leading-[0.9] md:hidden"
              {...fadeUp(0.05)}
            >
              <span className="block">ALWAYS</span>
              <span className="mt-[0.06em] block pl-[8%]">TO THE TOP,</span>
            </motion.span>

            {/* Desktop: single line flush left */}
            <motion.span
              className="hidden text-[clamp(2.75rem,10.5vw,9.5rem)] leading-[0.86] md:block"
              {...fadeUp(0.05)}
            >
              {HOME_LOCKED_MOTTO.line1}
            </motion.span>

            <motion.div
              className="relative my-6 flex items-center gap-3 md:my-12 md:ml-[28%] md:mr-[10%] md:gap-4"
              aria-hidden="true"
              {...fadeUp(0.12)}
            >
              <span className="swiss-diamond h-2.5 w-2.5 shrink-0 bg-black dark:bg-white md:h-4 md:w-4" />
              <span className="h-px flex-1 bg-black dark:bg-white" />
              <span className="hidden font-swiss text-[10px] font-medium tracking-[0.35em] text-[#666666] uppercase tabular-nums md:inline">
                {t.home.motto.index}
              </span>
            </motion.div>

            {/* Mobile: indented second phrase */}
            <motion.span
              className="block pl-[16%] text-[clamp(2.5rem,14vw,4.5rem)] leading-[0.9] md:hidden"
              {...fadeUp(0.18)}
            >
              <span className="block">ALWAYS</span>
              <span className="mt-[0.06em] block">TOGETHER.</span>
            </motion.span>

            {/* Desktop: pushed right */}
            <motion.span
              className="hidden self-end text-right text-[clamp(2.75rem,10.5vw,9.5rem)] leading-[0.86] md:ml-[28%] md:block md:w-auto"
              {...fadeUp(0.18)}
            >
              {HOME_LOCKED_MOTTO.line2}
            </motion.span>
          </h2>
        </div>
      </section>

      {/* ── 02 Programs — full-viewport field ── */}
      <section
        aria-labelledby="home-programs-heading"
        className="relative -mx-6 flex min-h-[100dvh] w-[calc(100%+3rem)] flex-col justify-center overflow-hidden border-t-2 border-black px-6 dark:border-white md:-mx-10 md:w-[calc(100%+5rem)] md:px-10"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-y-[10%] left-[10%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute inset-y-0 left-[42%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute inset-y-[14%] left-[78%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
          <div className="absolute top-[30%] left-0 h-px w-[55%] bg-black/10 dark:bg-white/10" />
          <div className="absolute bottom-[28%] left-[20%] h-px w-[80%] bg-black/10 dark:bg-white/10" />
        </div>

        <div className="relative flex w-full flex-col gap-12 py-20 md:gap-16 md:py-24">
          {/* Header block */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-0 md:items-end">
            <motion.div
              className="flex flex-col gap-4 md:col-span-7"
              {...fadeUp(0)}
            >
              <div className="flex items-baseline gap-3">
                <SectionIndex value={t.home.programs.index} />
                <span className="font-swiss text-xs font-medium tracking-[0.2em] text-[#666666] uppercase">
                  {t.home.programs.label}
                </span>
              </div>
              <h2
                id="home-programs-heading"
                className="font-swiss text-[clamp(3rem,12vw,8rem)] font-black leading-[0.88] tracking-tighter"
              >
                {t.home.programs.headline}
              </h2>
            </motion.div>

            <motion.div
              className="flex flex-col gap-5 border-t border-black/20 pt-6 dark:border-white/20 md:col-span-5 md:border-t-0 md:border-l md:pl-10 md:pt-0"
              {...fadeUp(0.1)}
            >
              <p className="max-w-md font-alt text-base leading-relaxed tracking-tight text-[#666666] md:text-lg">
                {t.home.programs.body}
              </p>
              <Link
                href="/classes"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelayedNavigation("/classes");
                }}
                className="inline-flex w-fit font-swiss text-sm font-bold uppercase tracking-widest text-[#666666] transition-colors duration-150 hover:text-black dark:hover:text-white md:text-base"
              >
                {t.home.programs.cta}
              </Link>
            </motion.div>
          </div>

          {/* Program groups — stacked mobile, staggered desktop */}
          <ul className="flex flex-col gap-0">
            {programKeys.map((key, i) => {
              const item = t.home.programs[key];
              const isOffset = i % 2 === 1;

              return (
                <motion.li
                  key={key}
                  className={`relative border-t-2 border-black py-8 dark:border-white md:py-14 ${
                    isOffset ? "md:pl-[18%]" : "md:pr-[12%]"
                  }`}
                  {...fadeUp(0.12 + i * 0.1)}
                >
                  <div
                    className={`flex flex-col gap-3 md:gap-4 ${
                      isOffset
                        ? "md:items-end md:text-right"
                        : "items-start text-left"
                    }`}
                  >
                    <div
                      className={`flex items-baseline gap-3 ${
                        isOffset ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <span className="font-swiss text-xs font-medium tracking-[0.3em] text-[#666666] tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="swiss-diamond h-2.5 w-2.5 bg-black dark:bg-white"
                      />
                    </div>

                    <p className="font-swiss text-[clamp(2.5rem,11vw,5.5rem)] font-black leading-[0.9] tracking-tighter">
                      {item.name}
                    </p>

                    <p
                      className={`max-w-sm font-alt text-sm leading-snug tracking-tight text-[#666666] md:max-w-md md:text-base ${
                        isOffset ? "md:ml-auto" : ""
                      }`}
                    >
                      {item.line}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <motion.p
          className="pointer-events-none absolute bottom-0 left-6 z-10 whitespace-nowrap font-swiss text-[clamp(4.5rem,18vw,12rem)] font-black leading-[0.85] tracking-tighter uppercase md:left-10"
          aria-label={HOME_LOCKED_SEASON}
          {...fadeUp(0.2)}
        >
          {HOME_LOCKED_SEASON}
        </motion.p>
      </section>

      {/* ── 03 Gallery ── */}
      <section
        aria-labelledby="home-gallery-heading"
        className="relative border-t-2 border-black dark:border-white"
      >
        <div className="pointer-events-none absolute inset-y-0 left-[12%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
        <div className="pointer-events-none absolute inset-y-0 left-[72%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />

        <div className="relative py-10 md:py-12">
          <motion.div className="mb-6 flex items-baseline gap-3 md:mb-8" {...fadeUp(0)}>
            <SectionIndex value={t.home.gallery.index} />
            <h2
              id="home-gallery-heading"
              className="font-swiss text-xs font-medium tracking-[0.2em] text-[#666666] uppercase"
            >
              {t.home.gallery.label}
            </h2>
          </motion.div>

          {/* Drag gallery with release momentum */}
          <motion.div {...fadeUp(0.08)}>
            <GalleryStrip reducedMotion={reducedMotion} />
          </motion.div>
        </div>
      </section>

      {/* ── 04 Fall enrollment CTA ── */}
      <section
        aria-labelledby="home-enrollment-heading"
        className="relative border-t-2 border-b-2 border-black dark:border-white"
      >
        <motion.div
          className="flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between md:gap-10 md:py-14"
          {...fadeUp(0)}
        >
          <div className="flex flex-col gap-3">
            <SectionIndex value={t.home.enrollmentCta.index} />
            <h2
              id="home-enrollment-heading"
              className="font-swiss text-[clamp(2rem,7vw,3.75rem)] font-black leading-[0.95] tracking-tighter"
            >
              {t.home.enrollmentCta.line}
            </h2>
          </div>

          <Link
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              handleDelayedNavigation("/contact");
            }}
            className="inline-flex w-fit border-2 border-black bg-black px-8 py-3 font-swiss text-sm font-bold uppercase tracking-widest text-white transition-colors duration-150 hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white md:text-base"
          >
            {t.home.enrollmentCta.cta}
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import {
  HOME_LOCKED_MOTTO,
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

function ScrollTypewriter({
  text,
  className,
  reducedMotion,
}: {
  text: string;
  className?: string;
  reducedMotion: boolean | null;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.55"],
  });
  const chars = useTransform(scrollYProgress, [0, 1], [0, text.length]);

  const [visible, setVisible] = useState(0);

  useMotionValueEvent(chars, "change", (v) => {
    setVisible(Math.min(text.length, Math.max(0, Math.round(v))));
  });

  // Sync on mount in case the section is already in view (e.g. restored scroll).
  useEffect(() => {
    setVisible(Math.min(text.length, Math.max(0, Math.round(chars.get()))));
  }, [chars, text.length]);

  if (reducedMotion) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, visible)}</span>
      <span aria-hidden="true" className="opacity-0">
        {text.slice(visible)}
      </span>
    </p>
  );
}

function CaretTypewriter({
  text,
  className,
  id,
  reducedMotion,
  charMs = 72,
}: {
  text: string;
  className?: string;
  id?: string;
  reducedMotion: boolean | null;
  charMs?: number;
}) {
  const [visible, setVisible] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setVisible(0);
    setStarted(false);
  }, [text]);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(text.length);
      setStarted(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, text]);

  useEffect(() => {
    if (!started || reducedMotion) return;
    if (visible >= text.length) return;

    const timer = window.setTimeout(() => {
      setVisible((n) => Math.min(text.length, n + 1));
    }, charMs);

    return () => window.clearTimeout(timer);
  }, [started, visible, text.length, charMs, reducedMotion]);

  const done = visible >= text.length;

  return (
    <h2 ref={ref} id={id} className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, visible)}</span>
      {!reducedMotion && (
        <span
          aria-hidden="true"
          className={`ml-[0.02em] inline-block h-[0.78em] w-[0.08em] translate-y-[0.06em] bg-current align-baseline ${
            done ? "animate-caret-blink" : "opacity-100"
          }`}
        />
      )}
    </h2>
  );
}

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
  const programsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: programsRef,
    offset: ["start 0.75", "end 0.9"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

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

  const slideIn = (fromX: number, delay = 0) =>
    reducedMotion
      ? { initial: false as const, whileInView: undefined, transition: undefined }
      : {
          initial: { opacity: 0, x: fromX },
          whileInView: { opacity: 1, x: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
          viewport: { once: true, amount: 0.25 },
        };

  const mottoLine1 = HOME_LOCKED_MOTTO.line1.replace(/[.,]$/, "");
  const mottoLine2 = HOME_LOCKED_MOTTO.line2.replace(/[.,]$/, "");

  return (
    <div className="relative w-full bg-white text-black dark:bg-black dark:text-white swiss-no-select">
      {/* ── Motto ── */}
      <section
        aria-labelledby="home-motto-heading"
        className="relative flex min-h-dvh w-full items-center overflow-x-clip py-28 md:block md:min-h-0 md:pt-[20vw] md:pb-[14.5vw]"
      >
        <h2
          id="home-motto-heading"
          className="font-swiss text-[clamp(1.85rem,8vw,3rem)] font-bold uppercase leading-[0.8] tracking-tighter md:text-[8.55vw]"
        >
          <motion.span
            className="block whitespace-nowrap"
            {...slideIn(-96, 0)}
          >
            {mottoLine1}
          </motion.span>
          <motion.span
            className="mt-[0.08em] block whitespace-nowrap pl-[1.4em]"
            {...slideIn(96, 0.08)}
          >
            {mottoLine2}
          </motion.span>
        </h2>
      </section>

      {/* ── Programs ── */}
      <section
        aria-labelledby="home-programs-heading"
        className="relative w-full pb-24 md:pt-[14.5vw] md:pb-[10vw]"
      >
        {/* Header: Ages 3–18 + body / CTA */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <CaretTypewriter
            id="home-programs-heading"
            text={t.home.programs.headline}
            reducedMotion={reducedMotion}
            className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold leading-[0.92] tracking-tight md:text-[13.4vw]"
          />

          <motion.div
            className="flex max-w-[28rem] shrink-0 gap-5 md:max-w-[32rem] md:pt-[1.5vw]"
            {...fadeUp(0.1)}
          >
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
          </motion.div>
        </div>

        {/* Staggered program blocks */}
        <div
          ref={programsRef}
          className="relative mt-24 md:mt-[12vw] md:pb-[24vw]"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-linear-to-b from-black from-75% to-transparent dark:from-white md:block"
            style={{
              scaleY: reducedMotion ? 1 : lineScale,
              transformOrigin: "top",
            }}
          />

          <ul className="flex flex-col gap-24 md:gap-0">
            <li className="relative md:w-[48%] md:pt-[7.5vw] md:pr-8">
              <ScrollTypewriter
                text={t.home.programs.competitive.name}
                reducedMotion={reducedMotion}
                className="font-swiss text-[clamp(2.5rem,8vw,3.5rem)] font-bold leading-none tracking-tighter md:text-[7vw]"
              />
              <ScrollTypewriter
                text={t.home.programs.competitive.line}
                reducedMotion={reducedMotion}
                className="mt-5 max-w-[34rem] font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.5] tracking-tight text-[#6b6b6b] md:mt-7"
              />
            </li>

            <li className="relative md:mt-[25vw] md:ml-auto md:w-[48%] md:pl-8">
              <ScrollTypewriter
                text={t.home.programs.recreational.name}
                reducedMotion={reducedMotion}
                className="font-swiss text-[clamp(2.5rem,8vw,3.5rem)] font-bold leading-none tracking-tighter md:text-[7vw]"
              />
              <ScrollTypewriter
                text={t.home.programs.recreational.line}
                reducedMotion={reducedMotion}
                className="mt-5 max-w-[34rem] font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.5] tracking-tight text-[#6b6b6b] md:mt-7"
              />
            </li>
          </ul>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section
        aria-labelledby="home-gallery-heading"
        className="relative w-full"
      >
        <div className="relative pb-8 md:pb-8">
          <motion.h2
            id="home-gallery-heading"
            className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[11.5vw]"
            {...fadeUp(0)}
          >
            {t.home.gallery.label}
          </motion.h2>
          <div
            aria-hidden="true"
            className="mt-2 h-[3px] w-full bg-black dark:bg-white"
          />
        </div>

        <motion.div className="pb-20 md:pb-12" {...fadeUp(0.08)}>
          <GalleryStrip reducedMotion={reducedMotion} />
        </motion.div>
      </section>


      {/* ── 04 Fall enrollment CTA ── */}
      <section
        aria-labelledby="home-enrollment-heading"
        className="relative border-t-2 border-b-2 border-black dark:border-white"
      >
        <motion.div
          className="flex flex-col gap-6 py-14 md:flex-row md:items-end md:justify-between md:gap-10 md:py-14"
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

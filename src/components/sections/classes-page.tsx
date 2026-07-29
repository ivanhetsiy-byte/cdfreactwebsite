"use client";

import {
  motion,
  useAnimationControls,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";

import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";

/** Classes page copy — hardcoded English for now; translations can follow later. */
const COPY = {
  headline: "Our Classes",
  classes: [
    {
      name: "Jazz",
      focus: "Ages 3–16 · Performance",
      line: "Sharp musicality, style, and stage presence. Dancers drill clean isolations, sustained lines, and dynamic footwork, then push it all into full-out performance energy. Every combination is built to be felt from the back row — precise, expressive, and unmistakably CDF.",
      image: {
        src: "/images/classes/jazz.jpg",
        alt: "Dancer performing jazz on stage",
      },
    },
    {
      name: "Ballet",
      focus: "Ages 3–16 · Technique",
      line: "The technical foundation beneath every other discipline. We train posture, turnout, and clean lines with patience and exacting standards, moving from the barre to center work as dancers grow. The control and grace built here carry into jazz, acro, and every stage a dancer steps onto.",
      image: {
        src: "/images/classes/ballet.jpg",
        alt: "Dancer in a ballet pose",
      },
    },
    {
      name: "Acrobatics",
      focus: "Ages 3–16 · Tumbling",
      line: "Dynamic tumbling and partner skills built on a solid technical base. Dancers progress through rolls, walkovers, and aerials in a spotted, safety-first environment, earning each new trick step by step. Strength and body awareness grow together so every skill lands with confidence.",
      image: {
        src: "/images/classes/acrobatics.jpg",
        alt: "Dancer in an acrobatic pose",
      },
    },
    {
      name: "Gymnastics",
      focus: "Ages 3–16 · Conditioning",
      line: "Flexibility, strength, and control that power every routine. Conditioning, active mobility, and core work are trained from the ground up, building the range and stability that advanced choreography demands. It is the engine room of the studio — quiet work that makes the big moments possible.",
      image: {
        src: "/images/classes/gymnastics.jpg",
        alt: "Dancer training gymnastics",
      },
    },
  ],
  cta: {
    line: "Ready to enroll?",
    button: "Contact us →",
  },
} as const;

type ClassName = (typeof COPY.classes)[number]["name"];
type ClassItem = (typeof COPY.classes)[number];

/** Sized to keep long names (Acrobatics / Gymnastics) on one line on mobile. */
const TITLE_CLASS =
  "relative font-swiss text-[clamp(1.85rem,8.4vw,7.5rem)] font-bold uppercase leading-[0.88] tracking-tighter whitespace-nowrap text-black dark:text-white md:text-[11vw] lg:text-[13vw]";

/** Indices in "ACROBATICS" that tumble (R, B, T) — avoid end letters (fixes skew snap). */
const ACRO_FLIP_INDICES = new Set([2, 4, 6]);

/** Per-discipline letter motion — enter, idle loop, and distinct scroll-up exit. */
const TITLE_MOTION = {
  Jazz: {
    container: {
      visible: {
        transition: { staggerChildren: 0.045, delayChildren: 0.06 },
      },
      idle: {
        transition: { staggerChildren: 0.12, delayChildren: 0 },
      },
      exitUp: {
        transition: {
          staggerChildren: 0.03,
          staggerDirection: -1 as const,
          delayChildren: 0.02,
        },
      },
      exitDown: {
        transition: { staggerChildren: 0.02, delayChildren: 0 },
      },
    },
    letter: {
      hidden: { opacity: 0, y: 48, rotate: -8, scale: 0.85 },
      visible: {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 520, damping: 22 },
      },
      // Syncopated micro-isolations
      idle: {
        y: [0, -4, 0, -2, 0],
        rotate: [0, -2, 0, 1.5, 0],
        transition: {
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut" as const,
          times: [0, 0.2, 0.45, 0.7, 1],
        },
      },
      exitUp: {
        opacity: 0,
        y: 56,
        rotate: 8,
        scale: 0.88,
        transition: { type: "spring" as const, stiffness: 480, damping: 26 },
      },
      exitDown: {
        opacity: 0,
        y: -12,
        scale: 0.98,
        transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
      },
    },
  },
  Ballet: {
    container: {
      visible: {
        transition: { staggerChildren: 0.07, delayChildren: 0.1 },
      },
      idle: {
        transition: { staggerChildren: 0.14, delayChildren: 0 },
      },
      exitUp: {
        transition: {
          staggerChildren: 0.06,
          staggerDirection: -1 as const,
          delayChildren: 0.04,
        },
      },
      exitDown: {
        transition: { staggerChildren: 0.03, delayChildren: 0 },
      },
    },
    letter: {
      hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
      },
      // Stronger plié breathe
      idle: {
        y: [0, -12, 0],
        scale: [1, 1.04, 1],
        transition: {
          duration: 3.1,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      },
      exitUp: {
        opacity: 0,
        y: 36,
        filter: "blur(8px)",
        transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] as const },
      },
      exitDown: {
        opacity: 0,
        y: -10,
        filter: "blur(4px)",
        transition: { duration: 0.35, ease: [0.4, 0, 1, 1] as const },
      },
    },
  },
  Acrobatics: {
    container: {
      visible: {
        transition: { staggerChildren: 0.055, delayChildren: 0.04 },
      },
      idle: {
        transition: { staggerChildren: 0.1, delayChildren: 0 },
      },
      exitUp: {
        transition: {
          staggerChildren: 0.04,
          staggerDirection: -1 as const,
          delayChildren: 0.02,
        },
      },
      exitDown: {
        transition: { staggerChildren: 0.025, delayChildren: 0 },
      },
    },
    letter: {
      // Vertical flips (jump + rotateX) on R/B/T only — keeps diamond-edge letters stable
      hidden: (i: number) =>
        ACRO_FLIP_INDICES.has(i)
          ? { opacity: 0, y: 48, rotateX: -160, scale: 0.9 }
          : { opacity: 0, y: 28, scale: 0.95 },
      visible: {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        y: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 20 },
      },
      idle: (i: number) =>
        ACRO_FLIP_INDICES.has(i)
          ? {
              // Jump up, somersault, land
              y: [0, -36, -36, 0],
              rotateX: [0, 0, 360, 360],
              transition: {
                duration: 1.35,
                times: [0, 0.22, 0.78, 1],
                repeat: Infinity,
                repeatDelay: 2.3,
                ease: ["easeOut", "linear", "easeIn"] as const,
              },
            }
          : {
              y: [0, -3, 0],
              transition: {
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut" as const,
              },
            },
      exitUp: (i: number) =>
        ACRO_FLIP_INDICES.has(i)
          ? {
              opacity: 0,
              y: 44,
              rotateX: 160,
              scale: 0.9,
              transition: {
                type: "spring" as const,
                stiffness: 280,
                damping: 18,
              },
            }
          : {
              opacity: 0,
              y: 36,
              scale: 0.95,
              transition: {
                type: "spring" as const,
                stiffness: 280,
                damping: 18,
              },
            },
      exitDown: {
        opacity: 0,
        y: -12,
        scale: 0.96,
        transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
      },
    },
  },
  Gymnastics: {
    container: {
      visible: {
        transition: { staggerChildren: 0.05, delayChildren: 0.08 },
      },
      idle: {
        transition: { staggerChildren: 0.11, delayChildren: 0 },
      },
      exitUp: {
        transition: {
          staggerChildren: 0.04,
          staggerDirection: -1 as const,
          delayChildren: 0.03,
        },
      },
      exitDown: {
        transition: { staggerChildren: 0.025, delayChildren: 0 },
      },
    },
    letter: {
      hidden: { opacity: 0, scaleY: 1.7, scaleX: 0.72, y: 20 },
      visible: {
        opacity: 1,
        scaleY: 1,
        scaleX: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 340, damping: 20 },
      },
      // Stronger stretch pulse
      idle: {
        scaleY: [1, 1.14, 1],
        scaleX: [1, 0.9, 1],
        transition: {
          duration: 2.7,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      },
      exitUp: {
        opacity: 0,
        scaleY: 0.35,
        scaleX: 1.15,
        y: 24,
        transition: { type: "spring" as const, stiffness: 320, damping: 22 },
      },
      exitDown: {
        opacity: 0,
        scaleY: 0.85,
        y: -10,
        transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
      },
    },
  },
} as const;

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

function getScrollY() {
  if (typeof window === "undefined") return 0;
  const lenis = (window as Window & { lenis?: { scroll?: number } }).lenis;
  if (lenis && typeof lenis.scroll === "number") return lenis.scroll;
  return window.scrollY;
}

/**
 * White + mix-blend-difference copy of the title, clipped by its parent mask.
 * Only the letter fragments that sit over the photo are visible — those subtract.
 * Position is locked to the visible letter row (not the h2 line-box) so edges match.
 */
function KnockoutGlyph({
  name,
  titleRef,
}: {
  name: ClassName;
  titleRef: RefObject<HTMLElement | null>;
}) {
  const glyphRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const sync = () => {
      const glyph = glyphRef.current;
      const title = titleRef.current;
      const clip = glyph?.parentElement;
      if (!glyph || !title || !clip) return;

      // Prefer the real letter row — h2 line-box / sr-only skews getBoundingClientRect.
      const source =
        (title.querySelector("[data-title-visual]") as HTMLElement | null) ??
        title;

      const t = source.getBoundingClientRect();
      const c = clip.getBoundingClientRect();
      const style = getComputedStyle(source);

      // Sticky cards apply a CSS scale on the article. getBoundingClientRect is in
      // screen px, but absolute left/top inside the clip are in local (unscaled) px.
      const scaleX = clip.offsetWidth ? c.width / clip.offsetWidth : 1;
      const scaleY = clip.offsetHeight ? c.height / clip.offsetHeight : 1;

      glyph.style.left = `${(t.left - c.left) / scaleX}px`;
      glyph.style.top = `${(t.top - c.top) / scaleY}px`;
      glyph.style.fontSize = style.fontSize;
      glyph.style.letterSpacing = style.letterSpacing;
      glyph.style.lineHeight = style.lineHeight;
      glyph.style.fontWeight = style.fontWeight;
      glyph.style.fontFamily = style.fontFamily;

      // Mirror each title letter's live transform (stretch / flip / idle) into the subtract
      const sourceLetters = source.querySelectorAll<HTMLElement>(":scope > *");
      const glyphLetters = glyph.querySelectorAll<HTMLElement>(":scope > span");
      sourceLetters.forEach((srcLetter, i) => {
        const dst = glyphLetters[i];
        if (!dst) return;
        const ls = getComputedStyle(srcLetter);
        dst.style.transform = ls.transform === "none" ? "" : ls.transform;
        dst.style.transformOrigin = ls.transformOrigin;
        dst.style.opacity = ls.opacity;
        dst.style.filter = ls.filter === "none" ? "" : ls.filter;
      });
    };

    sync();
    const ro = new ResizeObserver(sync);
    if (titleRef.current) ro.observe(titleRef.current);
    const visual = titleRef.current?.querySelector("[data-title-visual]");
    if (visual) ro.observe(visual);

    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    void document.fonts?.ready.then(sync);

    // Keep locked through enter/exit/idle and sticky scale changes
    let raf = 0;
    let running = true;
    const tick = () => {
      if (!running) return;
      sync();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
      cancelAnimationFrame(raf);
    };
  }, [titleRef, name]);

  return (
    <span
      ref={glyphRef}
      aria-hidden="true"
      data-selection-ignore
      className="pointer-events-none absolute top-0 left-0 z-10 inline-flex flex-nowrap origin-top-left whitespace-nowrap font-swiss text-white uppercase leading-[0.88] tracking-tighter mix-blend-difference"
    >
      {name.split("").map((letter, i) => (
        <span
          key={`${name}-ko-${i}`}
          className="inline-block origin-bottom"
          style={{ transformStyle: "preserve-3d" }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

function MaskedPhoto({
  src,
  className,
  sizes,
  knockout,
  priority = false,
}: {
  src: string;
  className?: string;
  sizes: string;
  knockout?: ReactNode;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-black ${className ?? ""}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        quality={80}
        priority={priority}
      />
      {knockout}
    </div>
  );
}

/**
 * Discipline-specific geometric photo mask.
 * Each clipped region hosts a knockout title duplicate so only overlapping
 * letter fragments subtract against the photo.
 */
function ClassMask({
  item,
  titleRef,
}: {
  item: ClassItem;
  titleRef: RefObject<HTMLElement | null>;
}) {
  const { name, image } = item;
  const sizes = "(max-width: 768px) 90vw, 48vw";
  const knockout = <KnockoutGlyph name={name} titleRef={titleRef} />;

  if (name === "Jazz") {
    const strip =
      "relative isolate h-full w-[32%] shrink-0 overflow-hidden [clip-path:polygon(18%_0%,100%_0%,82%_100%,0%_100%)]";
    const crops = ["object-left", "object-center", "object-right"] as const;
    return (
      <div
        aria-hidden="true"
        className="flex h-[min(42vw,16rem)] w-full max-w-[min(92vw,22rem)] items-stretch justify-center gap-1.5 sm:h-[min(48vw,20rem)] sm:max-w-[28rem] md:h-[min(52vh,34rem)] md:max-w-[min(48vw,38rem)] md:gap-2.5"
      >
        {crops.map((crop, i) => (
          <div key={i} className={strip}>
            <div className="absolute inset-0 bg-black">
              <Image
                src={image.src}
                alt=""
                fill
                sizes={sizes}
                className={`object-cover ${crop}`}
                quality={80}
                priority={i === 0}
              />
            </div>
            <KnockoutGlyph name={name} titleRef={titleRef} />
          </div>
        ))}
      </div>
    );
  }

  if (name === "Ballet") {
    return (
      <div aria-hidden="true" className="flex justify-center">
        <MaskedPhoto
          src={image.src}
          sizes={sizes}
          className="aspect-square w-[min(58vw,16rem)] rounded-full sm:w-[min(48vw,20rem)] md:w-[min(42vw,34rem)]"
          knockout={knockout}
        />
      </div>
    );
  }

  if (name === "Acrobatics") {
    return (
      <div aria-hidden="true" className="flex justify-center">
        <MaskedPhoto
          src={image.src}
          sizes={sizes}
          className="swiss-diamond aspect-square w-[min(58vw,16rem)] sm:w-[min(48vw,20rem)] md:w-[min(42vw,34rem)]"
          knockout={knockout}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="flex justify-center">
      <MaskedPhoto
        src={image.src}
        sizes={sizes}
        className="aspect-[5/3] w-[min(78vw,20rem)] [clip-path:polygon(12%_0%,88%_0%,100%_50%,88%_100%,12%_100%,0%_50%)] sm:w-[min(60vw,26rem)] md:w-[min(48vw,40rem)]"
        knockout={knockout}
      />
    </div>
  );
}

const ClassNameTitle = forwardRef<
  HTMLHeadingElement,
  {
    name: ClassName;
    id: string;
    alignRight: boolean;
  }
>(function ClassNameTitle({ name, id, alignRight }, ref) {
  const reduceMotion = useReducedMotion();
  const motionConfig = TITLE_MOTION[name];
  const letters = name.split("");
  const localRef = useRef<HTMLHeadingElement | null>(null);
  const controls = useAnimationControls();
  const directionRef = useRef<"up" | "down">("down");
  const inViewRef = useRef(false);
  const inView = useInView(localRef, {
    amount: 0.2,
    once: false,
    // Fire enter/exit before the title is fully centered
    margin: "140px 0px 140px 0px",
  });
  inViewRef.current = inView;

  const setRefs = (node: HTMLHeadingElement | null) => {
    localRef.current = node;
    assignRef(ref, node);
  };

  useEffect(() => {
    let lastY = getScrollY();
    const onScroll = () => {
      const y = getScrollY();
      if (y > lastY + 0.5) directionRef.current = "down";
      else if (y < lastY - 0.5) directionRef.current = "up";
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;

    const run = async () => {
      if (inView) {
        await controls.start("visible");
        if (cancelled || !inViewRef.current) return;
        await controls.start("idle");
        return;
      }
      if (directionRef.current === "up") {
        await controls.start("exitUp");
        return;
      }
      await controls.start("exitDown");
    };

    void run();
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [inView, controls, reduceMotion]);

  if (reduceMotion) {
    return (
      <h2
        ref={setRefs}
        id={id}
        className={`relative z-10 ${TITLE_CLASS} ${alignRight ? "md:text-right" : ""}`}
      >
        <span data-title-visual>{name}</span>
      </h2>
    );
  }

  return (
    <motion.h2
      ref={setRefs}
      id={id}
      className={`relative z-10 ${TITLE_CLASS} ${alignRight ? "md:text-right" : ""}`}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: {},
        visible: motionConfig.container.visible,
        idle: motionConfig.container.idle,
        exitUp: motionConfig.container.exitUp,
        exitDown: motionConfig.container.exitDown,
      }}
      style={{ perspective: 900 }}
    >
      <span className="sr-only">{name}</span>
      <span
        data-title-visual
        aria-hidden="true"
        className={`inline-flex flex-nowrap ${alignRight ? "md:justify-end" : ""}`}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={`${name}-${i}`}
            custom={i}
            variants={motionConfig.letter as Variants}
            className={`inline-block will-change-transform ${
              name === "Acrobatics" ? "origin-center" : "origin-bottom"
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </motion.h2>
  );
});

/**
 * All class cards share one tall container so each sticky card pins in place
 * while the next (opaque) card scrolls up and covers it — the classic pile-up.
 * A single scroll progress drives every card's cover animation.
 */
function ClassStack() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={stackRef} className="relative w-full pb-[10vh]">
      {COPY.classes.map((item, i) => (
        <ClassStackCard
          key={item.name}
          item={item}
          index={i}
          total={COPY.classes.length}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}

/**
 * One class rendered as a sticky card. Each successive card pins slightly lower
 * so the cards beneath peek out. As the next card covers this one, the pinned
 * panel scales down and dims for depth.
 *
 * Title sits under the mask layer; a clipped knockout duplicate inside each
 * photo shape subtracts only where letters overlap the image.
 */
function ClassStackCard({
  item,
  index,
  total,
  progress,
}: {
  item: ClassItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const alignRight = index % 2 === 1;
  const isLast = index === total - 1;

  const start = index / total;
  const end = (index + 1) / total;
  const scale = useTransform(progress, [start, end], [1, 0.92]);
  const scrimOpacity = useTransform(progress, [start, end], [0, 0.4]);

  const topOffset = `calc(2.5rem + ${index * 2.75}rem)`;
  const headingId = `class-chapter-${index}`;
  const staticState = reduceMotion || isLast;

  const textBlock = (
    <div
      className={`relative z-10 flex min-w-0 flex-1 flex-col justify-center overflow-visible ${
        alignRight
          ? "md:items-end md:text-right md:-ml-[10%]"
          : "md:-mr-[10%]"
      }`}
    >
      <p className="relative z-20 mb-4 font-swiss text-xs font-medium tracking-[0.24em] text-[#666666] uppercase md:mb-[1vw] md:text-sm">
        {item.focus}
      </p>

      <ClassNameTitle
        ref={titleRef}
        name={item.name}
        id={headingId}
        alignRight={alignRight}
      />

      <p
        className={`relative z-20 mt-6 max-w-[42rem] font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.55] tracking-tight text-[#6b6b6b] md:mt-[2vw] ${
          alignRight ? "md:ml-auto" : ""
        }`}
      >
        {item.line}
      </p>
    </div>
  );

  const maskBlock = (
    <div
      className={`relative z-20 flex shrink-0 justify-center md:w-[48%] lg:w-[50%] ${
        alignRight ? "md:justify-start" : "md:justify-end"
      }`}
    >
      <ClassMask item={item} titleRef={titleRef} />
    </div>
  );

  return (
    <motion.article
      aria-labelledby={headingId}
      style={{
        top: topOffset,
        scale: staticState ? 1 : scale,
      }}
      className="sticky flex min-h-[52vh] flex-col justify-center overflow-hidden border border-black bg-white px-4 py-12 dark:border-white dark:bg-black md:min-h-[74vh] md:px-[6vw] md:py-[7vw]"
    >
      <div
        className={`flex flex-col gap-8 md:items-center md:gap-10 ${
          alignRight ? "md:flex-row" : "md:flex-row-reverse"
        }`}
      >
        {maskBlock}
        {textBlock}
      </div>

      {!staticState ? (
        <motion.div
          aria-hidden="true"
          style={{ opacity: scrimOpacity }}
          className="pointer-events-none absolute inset-0 z-30 bg-neutral-500"
        />
      ) : null}
    </motion.article>
  );
}

export function ClassesWireframes() {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);

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

  return (
    <div className="relative w-full bg-white text-black dark:bg-black dark:text-white">
      <section className="relative w-full pb-16 md:pb-[6vw]">
        <h1 className="font-swiss text-[clamp(2.5rem,10vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[11.5vw]">
          {COPY.headline}
        </h1>
      </section>

      <ClassStack />

      <section
        aria-labelledby="classes-cta-heading"
        className="relative w-full pt-28 pb-10 md:pt-[10vw] md:pb-[4vw]"
      >
        <h2
          id="classes-cta-heading"
          className="font-swiss text-[clamp(1.85rem,8vw,3rem)] font-bold uppercase leading-[0.95] tracking-tighter md:text-[5.8vw]"
        >
          {COPY.cta.line}
        </h2>

        <div>
          <Link
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              handleDelayedNavigation("/contact");
            }}
            className="mt-8 inline-flex w-fit border-2 border-black bg-black px-10 py-4 font-swiss text-base font-bold uppercase tracking-widest text-white transition-colors duration-150 hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white md:mt-[2vw] md:text-lg"
          >
            {COPY.cta.button}
          </Link>
        </div>
      </section>
    </div>
  );
}

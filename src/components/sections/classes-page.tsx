"use client";

import {
  motion,
  useAnimationControls,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  forwardRef,
  useEffect,
  useRef,
  type Ref,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

/** Classes page copy — hardcoded English for now; translations can follow later. */
const COPY = {
  headline: "Our Classes",
  classes: [
    {
      name: "Jazz",
      layout: "title-left",
      line: "Sharp musicality, style, and stage presence. Dancers drill clean isolations, sustained lines, and dynamic footwork, then push it all into full-out performance energy. Every combination is built to be felt from the back row — precise, expressive, and unmistakably CDF.",
    },
    {
      name: "Ballet",
      layout: "title-right",
      line: "The technical foundation beneath every other discipline. We train posture, turnout, and clean lines with patience and exacting standards, moving from the barre to center work as dancers grow. The control and grace built here carry into jazz, acro, and every stage a dancer steps onto.",
    },
    {
      name: "Acrobatics",
      layout: "stack-right-body",
      line: "Dynamic tumbling and partner skills built on a solid technical base. Dancers progress through rolls, walkovers, and aerials in a spotted, safety-first environment, earning each new trick step by step. Strength and body awareness grow together so every skill lands with confidence.",
    },
    {
      name: "Gymnastics",
      layout: "stack-inset",
      line: "Flexibility, strength, and control that power every routine. Conditioning, active mobility, and core work are trained from the ground up, building the range and stability that advanced choreography demands. It is the engine room of the studio — quiet work that makes the big moments possible.",
    },
  ],
} as const;

type ClassLayout = (typeof COPY.classes)[number]["layout"];
type ClassItem = (typeof COPY.classes)[number];
type ClassName = ClassItem["name"];

/** leading-none + slight padding keeps bold Swiss caps inside the line box. */
const HERO_CLASS =
  "font-swiss font-bold uppercase leading-none tracking-tighter text-black dark:text-white text-[clamp(3.25rem,12.8vw,18rem)] pt-[0.06em] pb-[0.04em]";

const TITLE_CLASS =
  "relative font-swiss font-bold uppercase leading-none tracking-tighter text-black dark:text-white text-[clamp(2.75rem,11vw,16rem)] md:whitespace-nowrap pt-[0.06em] pb-[0.04em]";

const BODY_CLASS =
  "font-swiss font-normal leading-[1.35] tracking-tight text-black dark:text-white text-[clamp(1.05rem,1.7vw,2.5rem)]";

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
      // Transform/opacity only — filter:blur on letter nodes thrash paint on scroll.
      hidden: { opacity: 0, y: 28 },
      visible: {
        opacity: 1,
        y: 0,
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
        transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] as const },
      },
      exitDown: {
        opacity: 0,
        y: -10,
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
  const lenis = getLenis();
  if (lenis && typeof (lenis as { animatedScroll?: number }).animatedScroll === "number") {
    return (lenis as { animatedScroll: number }).animatedScroll;
  }
  const winLenis = (window as Window & { lenis?: { scroll?: number } }).lenis;
  if (typeof winLenis?.scroll === "number") return winLenis.scroll;
  return window.scrollY;
}

function onLenisScroll(callback: () => void): () => void {
  const lenis = getLenis();
  if (lenis) return lenis.on("scroll", callback);

  let unsub: (() => void) | undefined;
  let raf = 0;
  let tries = 0;
  let usedNative = false;

  const attach = () => {
    const ready = getLenis();
    if (ready) {
      unsub = ready.on("scroll", callback);
      return;
    }
    if (tries++ < 60) {
      raf = requestAnimationFrame(attach);
      return;
    }
    usedNative = true;
    window.addEventListener("scroll", callback, { passive: true });
  };
  attach();

  return () => {
    cancelAnimationFrame(raf);
    unsub?.();
    if (usedNative) window.removeEventListener("scroll", callback);
  };
}

/**
 * Figma alignment (2544 artboard):
 * - Jazz / Ballet: body vertically centered on the title band; body left-aligned;
 *   title is intrinsic width with a tight gutter.
 * - Ballet: title right; body left block (~48% width).
 * - Acrobatics: title full-bleed left; body below, indented ~38.5%.
 * - Gymnastics: title + body share ~14% left inset; body under the G.
 */
function layoutClasses(layout: ClassLayout) {
  switch (layout) {
    case "title-left":
      return {
        article:
          "flex flex-col gap-6 md:flex-row md:items-center md:gap-x-[clamp(0.75rem,1.2vw,1.5rem)]",
        title: "shrink-0",
        body: "min-w-0 w-full md:w-auto md:flex-1 md:max-w-[min(52ch,50.5%)]",
        alignRight: false,
      };
    case "title-right":
      return {
        article:
          "flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-x-[clamp(0.75rem,1.2vw,1.5rem)]",
        title: "shrink-0 md:order-2",
        body: "min-w-0 w-full md:order-1 md:max-w-[min(52ch,48%)]",
        alignRight: true,
      };
    case "stack-right-body":
      return {
        article: "flex flex-col gap-8 md:gap-[clamp(1.5rem,2.5vw,2.75rem)]",
        title: "",
        body: "md:ml-[38.5%] md:max-w-[min(52ch,48%)]",
        alignRight: false,
      };
    case "stack-inset":
      return {
        article:
          "flex flex-col gap-8 md:gap-[clamp(1.5rem,2.5vw,2.75rem)] md:pl-[14%]",
        title: "",
        body: "md:max-w-[min(52ch,48%)]",
        alignRight: false,
      };
  }
}

const ClassNameTitle = forwardRef<
  HTMLHeadingElement,
  {
    name: ClassName;
    id: string;
    alignRight: boolean;
    className?: string;
  }
>(function ClassNameTitle({ name, id, alignRight, className = "" }, ref) {
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
    return onLenisScroll(onScroll);
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

  const headingClass = `${TITLE_CLASS} ${alignRight ? "md:text-right" : ""} ${className}`.trim();

  if (reduceMotion) {
    return (
      <h2 ref={setRefs} id={id} className={headingClass}>
        <span data-title-visual>{name}</span>
      </h2>
    );
  }

  return (
    <motion.h2
      ref={setRefs}
      id={id}
      className={headingClass}
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
            className={`inline-block ${
              name === "Acrobatics" ? "origin-center" : "origin-bottom"
            }`}
            style={{
              transformStyle: "preserve-3d",
              willChange: inView ? "transform" : "auto",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </motion.h2>
  );
});

function ClassSection({
  item,
  index,
}: {
  item: ClassItem;
  index: number;
}) {
  const { article, title, body, alignRight } = layoutClasses(item.layout);
  const headingId = `class-chapter-${index}`;

  return (
    <article
      aria-labelledby={headingId}
      data-class-section
      className={`relative w-full py-[clamp(4rem,12vh,9rem)] ${article}`}
    >
      <ClassNameTitle
        name={item.name}
        id={headingId}
        alignRight={alignRight}
        className={title}
      />
      <p
        data-class-body
        className={`${BODY_CLASS} ${body} opacity-0 will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100`}
      >
        {item.line}
      </p>
    </article>
  );
}

/**
 * Editorial type-led Classes page — oversized titles, asymmetric copy blocks,
 * per-discipline letter Motions, GSAP scrub on hero + body.
 */
export function ClassesWireframes() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root
        .querySelectorAll<HTMLElement>(
          "[data-class-body], [data-classes-hero]",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
          };

          const scrub = isDesktop ? 0.5 : 0.35;
          const hero = root.querySelector<HTMLElement>("[data-classes-hero]");

          if (hero) {
            gsap.fromTo(
              hero,
              { y: isDesktop ? 48 : 28, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: hero,
                  start: "top 92%",
                  end: "top 55%",
                  scrub,
                  invalidateOnRefresh: true,
                },
              },
            );
          }

          root
            .querySelectorAll<HTMLElement>("[data-class-body]")
            .forEach((body) => {
              gsap.fromTo(
                body,
                { y: isDesktop ? 40 : 24, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: body,
                    start: "top 92%",
                    end: "top 55%",
                    scrub,
                    invalidateOnRefresh: true,
                  },
                },
              );
            });
        },
      );
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full bg-white text-black dark:bg-black dark:text-white"
    >
      <header className="relative w-full overflow-visible pb-[clamp(3rem,8vh,6rem)]">
        <h1
          data-classes-hero
          className={`${HERO_CLASS} opacity-0 will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100`}
        >
          {COPY.headline}
        </h1>
      </header>

      <div className="relative w-full pb-[clamp(3rem,8vh,6rem)]">
        {COPY.classes.map((item, index) => (
          <ClassSection key={item.name} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

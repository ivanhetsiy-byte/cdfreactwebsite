"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { useRef, type CSSProperties } from "react";

import { requestRouteCover } from "@/lib/route-cover";

/** Classes page copy — hardcoded English for now; translations can follow later. */
const COPY = {
  kicker: "CDF · THE CLASSES",
  headerBody:
    "Jazz, ballet, acrobatics, and gymnastics — structured training for dancers aged 3–18, from first steps to the stage.",
  classes: [
    {
      name: "Jazz",
      line: "Sharp musicality, style, and stage presence — from clean isolations to full-out performance energy.",
    },
    {
      name: "Ballet",
      line: "The technical foundation: posture, lines, and discipline that elevate every other discipline.",
    },
    {
      name: "Acrobatics",
      line: "Dynamic tumbling and partner skills built on solid technique, so every trick lands with confidence.",
    },
    {
      name: "Gymnastics",
      line: "Flexibility, strength, and control that power every routine — trained safely from the ground up.",
    },
  ],
  cta: {
    line: "Ready to enroll?",
    button: "Contact us →",
  },
} as const;

type ClassName = (typeof COPY.classes)[number]["name"];

const SWISS_EASE = [0.22, 1, 0.36, 1] as const;

const TITLE_CLASS =
  "font-swiss text-[clamp(3.5rem,14vw,8rem)] font-bold uppercase leading-[0.88] tracking-tighter md:text-[13vw]";

type LetterMotion = {
  initial: Record<string, string | number>;
  animate: Record<string, string | number>;
  transition: Transition;
  stagger: number;
  style?: CSSProperties & { transformPerspective?: number };
};

/** Discipline-specific letter entrances — each mirrors the movement quality of the class. */
function getLetterMotion(name: ClassName): LetterMotion {
  switch (name) {
    case "Jazz":
      // Sharp isolations — snappy pops with a syncopated stagger
      return {
        initial: { opacity: 0, y: 36, skewX: 14, scale: 0.85 },
        animate: { opacity: 1, y: 0, skewX: 0, scale: 1 },
        transition: { duration: 0.28, ease: [0.2, 0.9, 0.3, 1.2] },
        stagger: 0.045,
      };
    case "Ballet":
      // Controlled rise — long lines, soft landing
      return {
        initial: { opacity: 0, y: 64, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.85, ease: SWISS_EASE },
        stagger: 0.07,
      };
    case "Acrobatics":
      // Tumbling flip into place
      return {
        initial: { opacity: 0, rotateX: 95, y: -28, scale: 0.9 },
        animate: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
        transition: {
          type: "spring",
          stiffness: 220,
          damping: 18,
          mass: 0.85,
        },
        stagger: 0.055,
        style: { transformPerspective: 900 },
      };
    case "Gymnastics":
      // Stretch and rebound — compressed then sprung tall
      return {
        initial: { opacity: 0, scaleY: 0.15, scaleX: 1.15, y: 48 },
        animate: { opacity: 1, scaleY: 1, scaleX: 1, y: 0 },
        transition: {
          type: "spring",
          stiffness: 280,
          damping: 16,
          mass: 0.7,
        },
        stagger: 0.05,
      };
  }
}

function ClassNameTitle({
  name,
  id,
  alignRight,
  reducedMotion,
}: {
  name: ClassName;
  id: string;
  alignRight: boolean;
  reducedMotion: boolean | null;
}) {
  const letters = name.split("");
  const motionSpec = getLetterMotion(name);

  if (reducedMotion) {
    return (
      <h2
        id={id}
        className={`${TITLE_CLASS} ${alignRight ? "md:text-right" : ""}`}
      >
        {name}
      </h2>
    );
  }

  return (
    <motion.h2
      id={id}
      className={`${TITLE_CLASS} flex flex-wrap ${
        alignRight ? "md:justify-end" : ""
      }`}
      aria-label={name}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: motionSpec.stagger },
        },
      }}
      style={motionSpec.style}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={`${name}-${letter}-${i}`}
          className="inline-block origin-bottom will-change-transform"
          aria-hidden="true"
          variants={{
            hidden: motionSpec.initial,
            visible: motionSpec.animate,
          }}
          transition={motionSpec.transition}
        >
          {letter}
        </motion.span>
      ))}
    </motion.h2>
  );
}

export function ClassesWireframes() {
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
      ? {
          initial: false as const,
          whileInView: undefined,
          transition: undefined,
        }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: {
            duration: 0.55,
            delay,
            ease: SWISS_EASE,
          },
          viewport: { once: true, amount: 0.25 },
        };

  const slideIn = (fromX: number, delay = 0) =>
    reducedMotion
      ? {
          initial: false as const,
          whileInView: undefined,
          transition: undefined,
        }
      : {
          initial: { opacity: 0, x: fromX },
          whileInView: { opacity: 1, x: 0 },
          transition: {
            duration: 0.7,
            delay,
            ease: SWISS_EASE,
          },
          viewport: { once: true, amount: 0.25 },
        };

  return (
    <div className="relative w-full bg-white text-black dark:bg-black dark:text-white swiss-no-select">
      {/* ── Compact intro — kicker + body only; class names own the display type ── */}
      <section
        aria-labelledby="classes-intro"
        className="relative w-full pb-20 md:pb-[8vw]"
      >
        <p className="mb-6 font-swiss text-xs font-medium tracking-[0.28em] text-[#666666] uppercase md:mb-[1.5vw] md:text-sm">
          {COPY.kicker}
        </p>
        <motion.p
          id="classes-intro"
          className="max-w-[36rem] font-alt text-[clamp(1.125rem,1.8vw,1.75rem)] leading-[1.45] tracking-tight text-[#6b6b6b]"
          {...fadeUp(0)}
        >
          {COPY.headerBody}
        </motion.p>
      </section>

      {/* ── Full-bleed chapters — one tall block per class ── */}
      <div className="relative w-full">
        {COPY.classes.map((item, i) => {
          const alignRight = i % 2 === 1;
          const headingId = `class-chapter-${i}`;

          return (
            <section
              key={item.name}
              aria-labelledby={headingId}
              className="relative flex min-h-[70vh] flex-col justify-center border-t border-black/20 py-[14vw] dark:border-white/20 md:py-[12vw]"
            >
              <ClassNameTitle
                name={item.name}
                id={headingId}
                alignRight={alignRight}
                reducedMotion={reducedMotion}
              />

              <motion.p
                className={`mt-8 max-w-[32rem] font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.55] tracking-tight text-[#6b6b6b] md:mt-[2.5vw] ${
                  alignRight ? "md:ml-auto md:text-right" : ""
                }`}
                {...fadeUp(0.2)}
              >
                {item.line}
              </motion.p>
            </section>
          );
        })}
        <div
          aria-hidden="true"
          className="h-0.5 w-full bg-black dark:bg-white"
        />
      </div>

      {/* ── Closing CTA ── */}
      <section
        aria-labelledby="classes-cta-heading"
        className="relative w-full pt-28 pb-10 md:pt-[10vw] md:pb-[4vw]"
      >
        <motion.h2
          id="classes-cta-heading"
          className="font-swiss text-[clamp(1.85rem,8vw,3rem)] font-bold uppercase leading-[0.95] tracking-tighter md:text-[5.8vw]"
          {...slideIn(-96, 0)}
        >
          {COPY.cta.line}
        </motion.h2>

        <motion.div {...fadeUp(0.12)}>
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
        </motion.div>
      </section>
    </div>
  );
}

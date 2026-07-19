"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { requestRouteCover } from "@/lib/route-cover";

/** About page copy — hardcoded English for now; translations can follow later. */
const COPY = {
  kicker: "CDF · THE STUDIO",
  headline: "About Us",
  headerBody:
    "CDF is a competitive and recreational dance studio where dancers aged 3–18 train, perform, and grow together.",
  headerCta: "Meet our staff →",
  intro:
    "Always to the top, always together — a studio built on professional pedagogy and the belief that every dancer deserves a stage.",
  story: {
    title: "Who We Are",
    p1: "CDF is a home for dancers of every level — from a first plié to national finals. Our training is rooted in gymnastics, ballet, and acrobatics, taught with structure, patience, and high standards.",
    p2: "We grow dancers, not just routines. Every class builds technique, discipline, and confidence that carry far beyond the studio floor.",
  },
  imageCaption: "SEASON 12 · CDF",
  values: {
    heading: "What We Teach",
    items: [
      {
        name: "Gymnastics",
        line: "Flexibility, strength, and control that power every routine — trained safely from the ground up.",
      },
      {
        name: "Ballet",
        line: "The technical foundation: posture, lines, and discipline that elevate every other discipline.",
      },
      {
        name: "Acrobatics",
        line: "Dynamic tumbling and partner skills built on solid technique, so every trick lands with confidence.",
      },
    ],
  },
  stats: [
    { value: "12", label: "Seasons on stage" },
    { value: "200+", label: "Dancers trained" },
    { value: "50+", label: "Competition awards" },
  ],
  cta: {
    line: "Ready to join the family?",
    button: "Contact us →",
  },
} as const;

export function AboutWireframes() {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const teamImageRef = useRef<HTMLImageElement>(null);
  const [imageInView, setImageInView] = useState(false);

  // Same treatment as the home mission image — fade to color while in view.
  useEffect(() => {
    const el = teamImageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setImageInView(entries.some((e) => e.isIntersecting));
      },
      { root: null, rootMargin: "-20% 0px -20% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
            ease: [0.22, 1, 0.36, 1] as const,
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
            ease: [0.22, 1, 0.36, 1] as const,
          },
          viewport: { once: true, amount: 0.25 },
        };

  return (
    <div className="relative w-full bg-white text-black dark:bg-black dark:text-white swiss-no-select">
      {/* ── Page header — programs-header slot: big type left, rail + body right ── */}
      <section
        aria-labelledby="about-heading"
        className="relative w-full pb-24 md:pb-[10vw]"
      >
        <p className="mb-6 font-swiss text-xs font-medium tracking-[0.28em] text-[#666666] uppercase md:mb-[2vw] md:text-sm">
          {COPY.kicker}
        </p>

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <motion.h1
            id="about-heading"
            className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[11.5vw]"
            {...slideIn(-64, 0)}
          >
            {COPY.headline}
          </motion.h1>

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
                {COPY.headerBody}
              </p>
              <Link
                href="/staff"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelayedNavigation("/staff");
                }}
                className="inline-flex w-fit font-swiss text-[clamp(1rem,1.6vw,1.5rem)] font-bold leading-[1.45] uppercase tracking-tight text-[#616161] transition-colors duration-150 hover:text-black dark:hover:text-white"
              >
                {COPY.headerCta}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Intro statement — right-shifted like the home statement block ── */}
      <section aria-label="Studio intro" className="relative w-full pb-28 md:pb-[10vw]">
        <motion.div
          className="flex gap-5 md:ml-auto md:max-w-[52rem] md:gap-8"
          {...fadeUp(0)}
        >
          <span
            aria-hidden="true"
            className="mt-1 hidden w-px shrink-0 self-stretch bg-black dark:bg-white md:block"
          />
          <p className="border-t border-black/20 pt-5 font-alt text-[clamp(1.375rem,2.6vw,2.5rem)] leading-[1.35] tracking-tight text-[#6b6b6b] dark:border-white/20 md:border-t-0 md:pt-0">
            {COPY.intro}
          </p>
        </motion.div>
      </section>

      {/* ── Story — heading + copy left, diamond media right ── */}
      <section
        aria-labelledby="about-story-heading"
        className="relative w-full pb-28 md:pb-[10vw]"
      >
        <div className="flex flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="md:max-w-[46rem]">
            <motion.h2
              id="about-story-heading"
              className="font-swiss text-[clamp(2.5rem,10vw,4rem)] font-bold leading-[0.92] tracking-tighter uppercase md:text-[6.5vw]"
              {...slideIn(-64, 0)}
            >
              {COPY.story.title}
            </motion.h2>

            <motion.div
              className="mt-10 flex flex-col gap-6 md:mt-[3vw]"
              {...fadeUp(0.1)}
            >
              <p className="font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.55] tracking-tight text-[#6b6b6b]">
                {COPY.story.p1}
              </p>
              <p className="font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.55] tracking-tight text-[#6b6b6b]">
                {COPY.story.p2}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="relative mx-auto flex shrink-0 items-center gap-6 md:mx-0 md:gap-8"
            {...slideIn(64, 0.1)}
          >
            <p
              aria-hidden="true"
              className="hidden rotate-180 font-swiss text-sm font-medium tracking-[0.28em] text-[#666666] uppercase md:block"
              style={{ writingMode: "vertical-rl" }}
            >
              {COPY.imageCaption}
            </p>
            <div className="relative aspect-[2/3] w-[16rem] overflow-hidden bg-black md:w-[19rem] lg:w-[22rem]">
              <Image
                ref={teamImageRef}
                src="/images/about-team.png"
                alt="CDF team posing with the World Champion trophy"
                fill
                sizes="(max-width: 768px) 64vw, 22rem"
                className={`object-cover transition-[filter] duration-700 [will-change:filter] ${
                  imageInView
                    ? "grayscale-0 brightness-100 contrast-100"
                    : "grayscale brightness-95 contrast-105"
                }`}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Disciplines list — gallery-style heading rule + mission-style rows ── */}
      <section
        aria-labelledby="about-values-heading"
        className="relative w-full pb-28 md:pb-[10vw]"
      >
        <div className="relative pb-8">
          <motion.h2
            id="about-values-heading"
            className="font-swiss text-[clamp(2.5rem,10vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[8vw]"
            {...fadeUp(0)}
          >
            {COPY.values.heading}
          </motion.h2>
          <div
            aria-hidden="true"
            className="mt-2 h-[3px] w-full bg-black dark:bg-white"
          />
        </div>

        <ul className="flex flex-col">
          {COPY.values.items.map((item, i) => (
            <motion.li
              key={item.name}
              className="grid grid-cols-1 gap-4 border-b border-black/20 py-9 dark:border-white/20 md:grid-cols-12 md:items-baseline md:gap-8 md:py-[3.2vw]"
              {...fadeUp(i * 0.06)}
            >
              <h3 className="font-swiss text-[clamp(1.875rem,7vw,3rem)] font-bold leading-none tracking-tighter md:col-span-6 md:text-[4.4vw]">
                {item.name}
              </h3>
              <p className="max-w-[34rem] font-alt text-[clamp(0.9375rem,1.3vw,1.25rem)] leading-[1.5] tracking-tight text-[#6b6b6b] md:col-span-6">
                {item.line}
              </p>
            </motion.li>
          ))}
        </ul>
        <div
          aria-hidden="true"
          className="h-0.5 w-full bg-black dark:bg-white"
        />
      </section>

      {/* ── Stats — three ruled columns with oversized numerals ── */}
      <section
        aria-label="CDF in numbers"
        className="relative w-full pb-28 md:pb-[10vw]"
      >
        <dl className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {COPY.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col gap-3 border-t border-black pt-5 dark:border-white"
              {...fadeUp(i * 0.08)}
            >
              <dd className="order-1 font-swiss-compressed text-[clamp(4.5rem,14vw,8rem)] font-black leading-[0.85] tracking-tighter md:text-[9vw]">
                {stat.value}
              </dd>
              <dt className="order-2 font-swiss text-xs font-medium tracking-[0.24em] text-[#666666] uppercase md:text-sm">
                {stat.label}
              </dt>
            </motion.div>
          ))}
        </dl>
      </section>

      {/* ── Closing CTA — motto-scale line + muted link ── */}
      <section
        aria-labelledby="about-cta-heading"
        className="relative w-full pb-10 md:pb-[4vw]"
      >
        <motion.h2
          id="about-cta-heading"
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
            className="mt-8 inline-flex w-fit font-swiss text-[clamp(1.125rem,2vw,1.75rem)] font-bold uppercase leading-[1.45] tracking-tight text-[#616161] transition-colors duration-150 hover:text-black dark:hover:text-white md:mt-[2vw]"
          >
            {COPY.cta.button}
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

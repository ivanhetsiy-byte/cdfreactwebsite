"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  HOME_LOCKED_DISCIPLINES,
  HOME_LOCKED_SEASON,
} from "@/context/LanguageContext";

export function Hero() {
  const reducedMotion = useReducedMotion();

  const enter = reducedMotion
    ? { initial: false as const, animate: undefined }
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
      };

  const seasonEnter = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: -24 },
        animate: { opacity: 1, x: 0 },
        transition: {
          duration: 0.7,
          delay: 0.1,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[calc(100dvh-11rem)] w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white md:min-h-[calc(100dvh-13rem)]"
    >
      {/* Swiss hairline rails */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-y-[12%] left-[12%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
        <div className="absolute inset-y-0 left-[38%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
        <div className="absolute inset-y-[8%] left-[72%] hidden w-px bg-black/10 dark:bg-white/10 md:block" />
        <div className="absolute top-[28%] left-[4%] hidden h-px w-[92%] bg-black/10 dark:bg-white/10 md:block" />
        <div className="absolute top-[72%] left-0 hidden h-px w-[70%] bg-black/10 dark:bg-white/10 md:block" />
      </div>

      {/* Season — continuous extreme Swiss type, top-left, bleeds past edge */}
      <motion.p
        className="pointer-events-none absolute top-0 left-0 z-10 max-w-none whitespace-nowrap font-swiss-compressed text-[clamp(4.5rem,22vw,18rem)] font-black leading-none tracking-tighter uppercase swiss-no-select"
        aria-label={HOME_LOCKED_SEASON}
        {...seasonEnter}
      >
        {HOME_LOCKED_SEASON}
      </motion.p>

      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <motion.h1
          id="hero-heading"
          className="font-swiss-compressed text-[12vw] leading-none font-black tracking-tighter uppercase md:text-[15vw] swiss-no-select"
          {...enter}
        >
          CDF
        </motion.h1>
      </div>

      <motion.p
        className="absolute bottom-0 left-0 font-swiss text-xs font-medium tracking-[0.28em] text-[#666666] uppercase md:text-sm"
        {...(reducedMotion
          ? {}
          : {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: {
                duration: 0.6,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              },
            })}
      >
        {HOME_LOCKED_DISCIPLINES}
      </motion.p>
    </section>
  );
}

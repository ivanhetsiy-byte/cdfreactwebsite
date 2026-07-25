"use client";

import { HOME_LOCKED_SEASON } from "@/context/LanguageContext";

export function Hero() {
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
      <p
        className="pointer-events-none absolute top-0 left-0 z-10 max-w-none whitespace-nowrap font-swiss-compressed text-[clamp(4.5rem,22vw,18rem)] font-black leading-none tracking-tighter uppercase swiss-no-select"
        aria-label={HOME_LOCKED_SEASON}
      >
        {HOME_LOCKED_SEASON}
      </p>

      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <h1
          id="hero-heading"
          className="font-swiss-compressed text-[12vw] leading-none font-black tracking-tighter uppercase md:text-[15vw] swiss-no-select"
        >
          CDF
        </h1>
      </div>
    </section>
  );
}

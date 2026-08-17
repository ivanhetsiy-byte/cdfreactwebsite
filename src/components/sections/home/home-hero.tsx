import Link from "next/link";

import { HomeEnrollmentMarquee } from "@/components/sections/home/home-enrollment-marquee";
import { FadeInText } from "@/components/ui/fade-in-text";
import { FoldText } from "@/components/ui/fold-text";

/**
 * Figma Home redesign — Enrollment Container
 * Mobile 390 (`14:55`) · Tablet 810 (`14:3`) · Desktop 1200 (`11:89`)
 *
 * Full-viewport-width first screen. Vertical placement:
 * mobile — slightly above center; tablet (810) — true center;
 * desktop (1200+) — pinned to the bottom. Scales with vw.
 */
export function HomeHero() {
  return (
    <section
      id="home-hero"
      aria-labelledby="home-season-heading"
      className={[
        "relative flex min-h-dvh w-full flex-col overflow-x-clip bg-background text-foreground",
        "justify-center pb-[8vh]",
        "home-md:pb-0",
        "home-lg:justify-end home-lg:pb-[clamp(1rem,2.5vw,2rem)]",
      ].join(" ")}
    >
      <div className="flex w-full max-w-none flex-col px-[clamp(6px,1.6vw,19px)]">
        <FoldText
          as="h1"
          id="home-season-heading"
          text="Season 12"
          scrub={false}
          trigger="#home-hero"
          scrollStart="top bottom"
          scrollEnd="bottom top"
          className="w-full whitespace-nowrap font-swiss text-[17.4vw] font-normal uppercase leading-none tracking-normal text-foreground"
        />

        <HomeEnrollmentMarquee className="mt-[clamp(8px,0.92vw,11px)]" />

        <Link
          href="/classes"
          className="mt-[clamp(8px,0.92vw,11px)] inline-block w-fit self-start font-swiss text-[6.25vw] font-normal leading-none text-foreground transition-opacity hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <FadeInText
            as="span"
            scrub={false}
            trigger="#home-hero"
            scrollStart="top bottom"
            scrollEnd="bottom top"
          >
            Enrollment Now Open →
          </FadeInText>
        </Link>
      </div>
    </section>
  );
}

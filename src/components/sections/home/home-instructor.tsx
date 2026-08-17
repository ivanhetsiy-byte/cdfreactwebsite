"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { FadeInText } from "@/components/ui/fade-in-text";
import { prefersReducedMotion } from "@/lib/motion-env";

gsap.registerPlugin(ScrollTrigger);

/** Production home copy — kept local so this section does not import `lab/`. */
const INSTRUCTOR = {
  name: "Mykhaylo Hetsiy",
  role: "Founder/Lead Artist",
  blurb:
    "(Михайло) Childrens Dance Factory (CDF)™ merges craft with stage art, using world-trained technique to craft unique dance experiences that give students a lasting stage impact.",
} as const;

/**
 * Figma Home redesign — Instructor / Community
 * Portrait and bio sit in the left column; community image on the right.
 */
export function HomeInstructor() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".home-instructor-photo", {
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home-instructor"
      aria-labelledby="home-instructor-heading"
      className={[
        "w-full bg-background text-foreground",
        "home-md:flex home-md:min-h-screen home-md:flex-col home-md:justify-center home-md:py-20",
        "home-lg:flex home-lg:min-h-screen home-lg:w-full home-lg:flex-col home-lg:items-center home-lg:justify-center home-lg:py-24",
      ].join(" ")}
    >
      <div
        className={[
          "w-full min-w-0 px-6",
          "home-md:grid home-md:grid-cols-2 home-md:items-start home-md:gap-x-10",
          "home-lg:mx-auto home-lg:grid home-lg:max-w-[1200px] home-lg:grid-cols-12 home-lg:items-start home-lg:gap-8 home-lg:px-8",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-auto min-w-0 flex-col items-start justify-start gap-6 py-10",
            "home-md:min-h-0 home-md:justify-start home-md:gap-6 home-md:py-0",
            "home-lg:col-span-5",
          ].join(" ")}
        >
          <FadeInText
            as="h2"
            id="home-instructor-heading"
            overflowHidden={false}
            className="w-full text-left font-swiss text-[65px] font-normal leading-none home-md:text-[74px] home-lg:text-[95px]"
          >
            Instructor
          </FadeInText>

          <figure className="flex w-full min-w-0 flex-col items-start">
            <div
              className="home-instructor-photo relative aspect-[188/215] w-[188px] max-w-full overflow-hidden home-md:w-[214px] home-lg:w-[317px]"
            >
              <Image
                src="/images/staff/mykhaylo.jpg"
                alt="Mykhaylo Hetsiy"
                fill
                sizes="(max-width: 809px) 188px, (max-width: 1199px) 214px, 317px"
                className="object-cover object-center"
              />
            </div>
            <figcaption className="mt-3 w-full min-w-0 max-w-full text-left font-swiss font-normal">
              <FadeInText
                as="p"
                className="w-full text-[28px] leading-snug home-md:text-[15px] home-lg:text-[19px]"
              >
                {INSTRUCTOR.name}
              </FadeInText>
              <FadeInText
                as="p"
                className="w-full text-[28px] leading-snug home-md:text-[15px] home-lg:text-[19px]"
              >
                {INSTRUCTOR.role}
              </FadeInText>
              <FadeInText
                as="p"
                className="mt-4 w-full text-[15px] leading-snug home-md:text-[13px] home-lg:text-[15px]"
              >
                {INSTRUCTOR.blurb}
              </FadeInText>
            </figcaption>
          </figure>
        </div>

        <div
          className={[
            "flex h-auto w-full min-w-0 flex-col justify-start gap-4 py-10",
            "home-md:min-h-0 home-md:justify-start home-md:py-0",
            "home-lg:col-span-7",
          ].join(" ")}
        >
          <div className="flex w-full items-start justify-between gap-4 font-swiss text-[10px] leading-tight home-md:text-[15px] home-lg:text-[19px]">
            <FadeInText as="p">Our Community</FadeInText>
            <FadeInText as="p" className="text-right">
              2025-2026
              <br />
              Season 11
            </FadeInText>
          </div>

          <div className="home-instructor-photo relative aspect-[289/328] h-auto w-full max-w-full overflow-hidden">
            <Image
              src="/images/community.png"
              alt="CDF community on stage at The Finals with trophies"
              fill
              sizes="(max-width: 809px) 100vw, (max-width: 1199px) 50vw, 581px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

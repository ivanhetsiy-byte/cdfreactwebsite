"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SplitReveal } from "@/components/motion/SplitReveal";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

gsap.registerPlugin(ScrollTrigger);

export type AboutTeamMember = {
  name: string;
  role: string;
  photo: string;
};

type AboutTeamTeaserProps = {
  eyebrow: string;
  heading: string;
  cta: string;
  members: readonly AboutTeamMember[];
};

/**
 * Minimal dark team grid.
 *
 * - Eyebrow slides in from left on scroll-enter
 * - Heading uses SplitReveal (words)
 * - Cards: ScrollTrigger.batch stagger from y:40
 * - Photos: CSS grayscale → full-colour on group-hover (unchanged)
 * - All color tokens updated for dark context
 */
export function AboutTeamTeaser({
  eyebrow,
  heading,
  cta,
  members,
}: AboutTeamTeaserProps) {
  const go = useDelayedNavigation();
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const eyebrowEl = eyebrowRef.current;
    const ctaEl = ctaRef.current;
    const grid = gridRef.current;
    if (!section || !eyebrowEl || !grid) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        eyebrowEl,
        { xPercent: -30, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        },
      );

      if (ctaEl) {
        gsap.fromTo(
          ctaEl,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            delay: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      const cards = grid.querySelectorAll<HTMLElement>("[data-team-card]");
      gsap.set(cards, { opacity: 0, y: 44 });

      ScrollTrigger.batch(cards, {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.13,
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 44,
            duration: 0.5,
            ease: "power2.in",
            stagger: 0.07,
          }),
        start: "top 78%",
      });
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [members.length]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-team-heading"
      className="relative w-full pb-28 md:pb-[10vw]"
    >
      {/* Header row */}
      <div className="mb-10 flex flex-col gap-6 md:mb-[3.5vw] md:flex-row md:items-end md:justify-between">
        <div>
          <p
            ref={eyebrowRef}
            className="mb-3 font-swiss text-xs font-medium tracking-[0.28em] text-white/30 uppercase md:text-sm"
          >
            {eyebrow}
          </p>

          <SplitReveal
            text={heading}
            as="h2"
            id="about-team-heading"
            splitBy="words"
            stagger={0.08}
            onScroll
            scrollStart="top 82%"
            className="font-swiss text-[clamp(2.25rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tighter text-white"
          />
        </div>

        <Link
          ref={ctaRef}
          href="/staff"
          onClick={(e) => {
            e.preventDefault();
            go("/staff");
          }}
          className="inline-flex w-fit font-swiss text-[clamp(1rem,1.5vw,1.35rem)] font-bold uppercase tracking-tight text-white/30 transition-colors duration-150 hover:text-white"
        >
          {cta}
        </Link>
      </div>

      {/* Team grid */}
      <ul
        ref={gridRef}
        className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-5 md:gap-8"
      >
        {members.map((member) => (
          <li key={member.name} data-team-card>
            <Link
              href="/staff"
              onClick={(e) => {
                e.preventDefault();
                go("/staff");
              }}
              className="group flex flex-col gap-4"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/5">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 92vw, 30vw"
                  className="object-cover grayscale brightness-75 transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:brightness-100"
                />
              </div>

              <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
                <p className="font-swiss text-[clamp(1.1rem,1.9vw,1.4rem)] font-bold uppercase leading-[1.1] tracking-tight text-white">
                  {member.name}
                </p>
                <p className="font-swiss text-xs font-medium tracking-[0.22em] text-white/30 uppercase">
                  {member.role}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

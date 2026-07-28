"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";

/** About page copy — hardcoded English for now; translations can follow later. */
const COPY = {
  headline: "About Us",
  headerBody:
    "CDF is a competitive and recreational dance studio where dancers aged 3–16 train, perform, and grow together.",
  headerCta: "MEET OUR STAFF →",
  statement: {
    lead: "Always to the top, always together — a studio built on professional pedagogy and the belief that every dancer deserves a stage.",
    p1: "CDF is a home for dancers of every level — from a first plié to national finals. Our training is rooted in gymnastics, ballet, and acrobatics, taught with structure, patience, and high standards.",
    p2: "We grow dancers, not just routines. Every class builds technique, discipline, and confidence that carry far beyond the studio floor.",
  },
  imageCaption: "SEASON 12 · CDF",
  stats: [
    { value: "12", label: "Seasons on stage" },
    { value: "200+", label: "Dancers trained" },
    { value: "50+", label: "Competition awards" },
  ],
} as const;

export function AboutWireframes() {
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
      {/* ── Page header — Contact / programs pattern ── */}
      <section
        aria-labelledby="about-heading"
        className="relative w-full pb-24 md:pb-[10vw]"
      >
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <h1
            id="about-heading"
            className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[11.5vw]"
          >
            {COPY.headline}
          </h1>

          <div className="flex max-w-[28rem] shrink-0 gap-5 md:max-w-[32rem] md:pt-[1.5vw]">
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
          </div>
        </div>
      </section>

      {/* ── Visual chapter — merged statement + dominant team image ── */}
      <section
        aria-label="Studio story"
        className="relative w-full pb-28 md:pb-[10vw]"
      >
        <div className="flex flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-16 lg:gap-20">
          <div className="flex max-w-[34rem] flex-col gap-6 md:max-w-[28rem] lg:max-w-[34rem]">
            <p className="border-t border-black/20 pt-5 font-alt text-[clamp(1.375rem,2.6vw,2.5rem)] leading-[1.35] tracking-tight text-[#6b6b6b] dark:border-white/20 md:border-t-0 md:pt-0">
              {COPY.statement.lead}
            </p>
            <p className="font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.55] tracking-tight text-[#6b6b6b]">
              {COPY.statement.p1}
            </p>
            <p className="font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.55] tracking-tight text-[#6b6b6b]">
              {COPY.statement.p2}
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-[36rem] shrink-0 flex-col gap-4 md:mx-0 md:w-[min(42vw,36rem)] md:max-w-none md:flex-row md:items-end md:gap-8">
            <p
              aria-hidden="true"
              className="mb-2 hidden rotate-180 font-swiss text-sm font-medium tracking-[0.28em] text-[#666666] uppercase md:block"
              style={{ writingMode: "vertical-rl" }}
            >
              {COPY.imageCaption}
            </p>
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
              <Image
                src="/images/about-team.png"
                alt="CDF team posing with the World Champion trophy"
                fill
                sizes="(max-width: 768px) 92vw, min(42vw, 36rem)"
                className="object-cover"
                priority
              />
            </div>
            <p className="font-swiss text-xs font-medium tracking-[0.28em] text-[#666666] uppercase md:hidden">
              {COPY.imageCaption}
            </p>
          </div>
        </div>
      </section>

      {/* ── Quiet closer — ruled stats ── */}
      <section
        aria-label="CDF in numbers"
        className="relative w-full pb-28 md:pb-[10vw]"
      >
        <dl className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {COPY.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-3 border-t border-black pt-5 dark:border-white"
            >
              <dd className="order-1 font-swiss text-[clamp(4.5rem,14vw,8rem)] font-black leading-[0.85] tracking-tighter md:text-[9vw]">
                {stat.value}
              </dd>
              <dt className="order-2 font-swiss text-xs font-medium tracking-[0.24em] text-[#666666] uppercase md:text-sm">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

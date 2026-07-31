"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

const INSTAGRAM =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
  "https://www.instagram.com/childancefactory";

export function MaintenanceView() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-m-brand]", { y: 18, opacity: 0, duration: 0.7 })
        .from(
          "[data-m-rule]",
          { scaleX: 0, transformOrigin: "left center", duration: 0.55 },
          "-=0.35",
        )
        .from(
          "[data-m-copy]",
          { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 },
          "-=0.25",
        )
        .from("[data-m-cta]", { y: 12, opacity: 0, duration: 0.5 }, "-=0.2");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="flex flex-1 flex-col justify-center pb-16 pt-20 md:pb-24 md:pt-10"
    >
      <p
        data-m-brand
        className="font-swiss-compressed text-[clamp(4.5rem,18vw,11rem)] font-black leading-[0.85] tracking-tighter uppercase text-white"
      >
        Childance
        <br />
        <span className="text-brand-red">Factory</span>
      </p>

      <div
        data-m-rule
        className="mt-8 h-px w-24 bg-brand-red md:mt-10 md:w-32"
        aria-hidden
      />

      <h1
        data-m-copy
        className="mt-8 max-w-xl font-swiss text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-tight tracking-tight text-white md:mt-10"
      >
        Site under maintenance
      </h1>

      <p
        data-m-copy
        className="mt-4 max-w-md font-alt text-base leading-relaxed text-white/65 md:text-lg"
      >
        We&apos;re making improvements behind the scenes. Check back soon —
        classes and programs continue as usual.
      </p>

      <div
        data-m-cta
        className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8"
      >
        <a
          href="mailto:info@cdf.studio"
          className="inline-flex w-fit items-center justify-center bg-brand-red px-6 py-3 font-swiss text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90"
        >
          info@cdf.studio
        </a>
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="font-alt text-sm text-white/55 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
        >
          Follow on Instagram
        </a>
      </div>
    </div>
  );
}

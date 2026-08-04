"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const KLEINLIFE = {
  name: "KleinLife Philadelphia",
  address: "10100 Jamison Ave, Philadelphia, PA 19116",
  lat: 40.1017,
  lon: -75.02091,
} as const;

/** Bounding box padding around the pin so the embed reads as a neighbourhood view. */
const MAP_DELTA = 0.012;

const OSM_EMBED_SRC = [
  "https://www.openstreetmap.org/export/embed.html",
  `?bbox=${KLEINLIFE.lon - MAP_DELTA}%2C${KLEINLIFE.lat - MAP_DELTA}`,
  `%2C${KLEINLIFE.lon + MAP_DELTA}%2C${KLEINLIFE.lat + MAP_DELTA}`,
  "&layer=mapnik",
  `&marker=${KLEINLIFE.lat}%2C${KLEINLIFE.lon}`,
].join("");

function CopyAddressButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable; keep UI quiet.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-1.5 text-[#999999] transition-colors duration-150 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * “Where We’re Located” — oversized title overlaps the live KleinLife map on
 * desktop (Figma), then stacks cleanly above the map on small screens.
 */
export function AboutWhereLocated() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const details = detailsRef.current;
    const map = mapRef.current;
    if (!section || !heading || !details || !map) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set([heading, details, map], { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(heading, { autoAlpha: 0, yPercent: 110 });
      gsap.set(details, { autoAlpha: 0, y: 36 });
      gsap.set(map, {
        clipPath: "inset(0 0 0 100%)",
        scale: 1.035,
        transformOrigin: "center center",
      });

      const reveal = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power4.out" },
        })
        .to(heading, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.95,
        })
        .to(
          map,
          {
            clipPath: "inset(0 0 0 0%)",
            scale: 1,
            duration: 1.15,
            ease: "power3.inOut",
          },
          0.12,
        )
        .to(
          details,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
          },
          0.48,
        );

      ScrollTrigger.create({
        trigger: section,
        start: "top 78%",
        onEnter: () => reveal.play(),
        onLeaveBack: () => reveal.reverse(),
      });
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-located-heading"
      className="relative w-full overflow-x-clip bg-white"
    >
      <div className="relative px-6 pt-24 pb-16 md:px-10 md:pt-36 md:pb-24 lg:pt-44 lg:pb-28">
        <div className="relative flex flex-col gap-8 md:block md:pt-[clamp(6rem,10vw,11rem)]">
          {/* Map — below copy on mobile; in-flow on the right so it sets section height on desktop */}
          <div
            ref={mapRef}
            data-lenis-prevent
            className="relative order-2 aspect-square w-full overflow-hidden border border-black/10 bg-[#e8e4df] md:order-none md:mt-[clamp(3rem,4vw,5rem)] md:ml-auto md:w-[56%] lg:w-[54%]"
          >
            <iframe
              title={`Map showing ${KLEINLIFE.name} at ${KLEINLIFE.address}`}
              src={OSM_EMBED_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0"
              allowFullScreen
            />
          </div>

          {/* Copy — over the map on desktop; pointer-events only on text/controls */}
          <div className="relative z-10 order-1 flex w-full flex-col justify-center md:absolute md:top-[clamp(6rem,10vw,11rem)] md:left-0 md:order-none md:w-[70%] md:justify-start md:pointer-events-none lg:w-[66%]">
            <div className="overflow-hidden">
              <h2
                ref={headingRef}
                id="about-located-heading"
                className="pointer-events-auto font-swiss text-[clamp(3.25rem,12vw,11rem)] font-normal leading-[0.92] tracking-tight text-black md:whitespace-nowrap"
              >
                Where We&rsquo;re Located
              </h2>
            </div>
            <div ref={detailsRef}>
              <p className="pointer-events-auto mt-5 max-w-[18ch] font-swiss text-[clamp(1.35rem,3.2vw,3.5rem)] font-normal leading-[1.15] tracking-tight text-black sm:max-w-none md:mt-7">
                We are currently at KleinLife
                <br className="hidden sm:block" /> Philadelphia.
              </p>
              <div className="pointer-events-auto mt-4 flex items-center gap-1.5">
                <p className="font-alt text-sm leading-relaxed tracking-tight text-black/50 md:text-base">
                  {KLEINLIFE.address}
                </p>
                <CopyAddressButton value={KLEINLIFE.address} label="address" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LocationMap, directionsUrl } from "./LocationMap";

gsap.registerPlugin(ScrollTrigger);

const iconClass = "size-3.5";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClass}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClass}
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClass}
      aria-hidden="true"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

const KLEINLIFE = {
  name: "KleinLife Philadelphia",
  address: "10100 Jamison Ave, Philadelphia, PA 19116",
  lat: 40.1017,
  lon: -75.02091,
} as const;

const MAGNET_MAX = 10;

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
      className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-1.5 text-black/40 transition-colors duration-150 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

/** Desktop magnetic “Get directions” — map is art; utility is explicit. */
function GetDirectionsButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const magnetRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cta = ctaRef.current;
    const magnet = magnetRef.current;
    const arrow = arrowRef.current;
    if (!cta || !magnet || !arrow) return;

    const desktopMq = window.matchMedia("(min-width: 768px)");
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let attached = false;
    let magnetX: gsap.QuickToFunc | null = null;
    let magnetY: gsap.QuickToFunc | null = null;

    const onMove = (e: PointerEvent) => {
      if (!magnetX || !magnetY) return;
      const rect = cta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      magnetX(
        gsap.utils.clamp(MAGNET_MAX * -1, MAGNET_MAX, (e.clientX - cx) * 0.35),
      );
      magnetY(
        gsap.utils.clamp(MAGNET_MAX * -1, MAGNET_MAX, (e.clientY - cy) * 0.35),
      );
    };

    const onEnter = () => {
      gsap.to(arrow, {
        x: 3,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      magnetX?.(0);
      magnetY?.(0);
      gsap.to(arrow, {
        x: 0,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      cta.removeEventListener("pointermove", onMove);
      cta.removeEventListener("pointerenter", onEnter);
      cta.removeEventListener("pointerleave", onLeave);
      magnetX?.(0);
      magnetY?.(0);
      gsap.set(arrow, { clearProps: "transform" });
      gsap.set(magnet, { clearProps: "transform" });
      magnetX = null;
      magnetY = null;
    };

    const attach = () => {
      if (attached || !desktopMq.matches || reducedMq.matches) return;
      attached = true;
      magnetX = gsap.quickTo(magnet, "x", { duration: 0.45, ease: "power3" });
      magnetY = gsap.quickTo(magnet, "y", { duration: 0.45, ease: "power3" });
      cta.addEventListener("pointermove", onMove);
      cta.addEventListener("pointerenter", onEnter);
      cta.addEventListener("pointerleave", onLeave);
    };

    const onMq = () => {
      if (desktopMq.matches && !reducedMq.matches) attach();
      else detach();
    };

    onMq();
    desktopMq.addEventListener("change", onMq);
    reducedMq.addEventListener("change", onMq);

    return () => {
      desktopMq.removeEventListener("change", onMq);
      reducedMq.removeEventListener("change", onMq);
      detach();
    };
  }, []);

  return (
    <a
      ref={ctaRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex w-fit cursor-pointer items-center gap-2 border border-black/15 bg-white/90 px-3.5 py-2 font-alt text-[11px] font-medium uppercase tracking-[0.14em] text-black backdrop-blur-sm transition-colors duration-200 hover:border-black hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:text-xs"
      aria-label={`Get directions to ${label}`}
    >
      <span ref={magnetRef} className="inline-flex items-center gap-2 will-change-transform">
        Get directions
        <span ref={arrowRef} className="inline-flex will-change-transform" aria-hidden="true">
          <ArrowUpRightIcon />
        </span>
      </span>
    </a>
  );
}

/**
 * “Where We’re Located” — oversized title overlaps the KleinLife map plate on
 * desktop; map is art, utility lives on the plate (address + Get directions).
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

  const mapsHref = directionsUrl(
    KLEINLIFE.lat,
    KLEINLIFE.lon,
    KLEINLIFE.address,
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-located-heading"
      className="relative w-full overflow-x-clip bg-white"
    >
      <div className="relative px-6 pt-24 pb-16 md:px-10 md:pt-36 md:pb-24 lg:pt-44 lg:pb-28">
        <div className="relative flex flex-col gap-8 md:block md:pt-[clamp(6rem,10vw,11rem)]">
          {/* Map plate — art + corner utility */}
          <div
            ref={mapRef}
            className="cdf-location-map relative order-2 aspect-square w-full overflow-hidden border border-black/10 bg-[#e8e4df] md:order-none md:mt-[clamp(3rem,4vw,5rem)] md:ml-auto md:w-[56%] lg:w-[54%]"
          >
            <LocationMap
              lat={KLEINLIFE.lat}
              lon={KLEINLIFE.lon}
              label={`${KLEINLIFE.name} at ${KLEINLIFE.address}`}
              className="absolute inset-0 size-full"
            />

            {/* Locked corner: address + magnetic Get directions */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white/85 via-white/50 to-transparent px-4 pb-4 pt-16 md:px-5 md:pb-5">
              <div className="pointer-events-auto flex max-w-[min(100%,20rem)] flex-col gap-3">
                <div className="flex items-start gap-1">
                  <p className="font-alt text-[11px] leading-snug tracking-tight text-black/55 md:text-xs">
                    {KLEINLIFE.address}
                  </p>
                  <CopyAddressButton value={KLEINLIFE.address} label="address" />
                </div>
                <GetDirectionsButton href={mapsHref} label={KLEINLIFE.name} />
              </div>
            </div>
          </div>

          {/* Copy — over the map on desktop; pointer-events only on text */}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

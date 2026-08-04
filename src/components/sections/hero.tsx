"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import LiquidEther from "@/components/backgrounds/LiquidEther";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

const LIQUID_COLORS = ["#ffffff", "#2d2c2d", "#000000"];
const MAGNET_MAX = 12;

/**
 * Production hero — Figma minimal white + Liquid Ether (hero-scoped pointer).
 */
export function Hero() {
  const go = useDelayedNavigation();
  const rootRef = useRef<HTMLElement>(null);
  const seasonRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const magnetRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const [showLiquid, setShowLiquid] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShowLiquid(!reduced);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const season = seasonRef.current;
    const cta = ctaRef.current;

    const ctx = gsap.context(() => {
      if (season) gsap.set(season, { opacity: 0, y: 36 });
      if (cta) gsap.set(cta, { opacity: 0, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(season, { opacity: 1, y: 0, duration: 1.15, ease: "power4.out" }, 0.15)
        .to(cta, { opacity: 1, y: 0, duration: 0.7 }, 0.55);
    }, root);

    return () => ctx.revert();
  }, []);

  // Desktop-only magnetic pull + arrow slide (quiet editorial hover).
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
        x: "0.2em",
        scaleX: 1.06,
        duration: 0.45,
        ease: "power3.out",
        transformOrigin: "left center",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      magnetX?.(0);
      magnetY?.(0);
      gsap.to(arrow, {
        x: 0,
        scaleX: 1,
        duration: 0.5,
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

    const sync = () => {
      if (desktopMq.matches && !reducedMq.matches) attach();
      else detach();
    };

    sync();
    desktopMq.addEventListener("change", sync);
    reducedMq.addEventListener("change", sync);

    return () => {
      desktopMq.removeEventListener("change", sync);
      reducedMq.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-heading"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-x-clip overflow-y-hidden bg-white px-6 text-black md:px-10"
    >
      {showLiquid ? (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <LiquidEther
            mouseForce={5}
            cursorSize={120}
            isBounce={false}
            isViscous
            viscous={5}
            colors={LIQUID_COLORS}
            autoDemo={false}
            autoSpeed={0.1}
            autoIntensity={0.5}
          />
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(28vh,14rem)] bg-gradient-to-b from-transparent to-white"
      />

      <h1 id="hero-heading" className="sr-only">
        Childrens Dance Factory — Season 12
      </h1>

      <div className="relative z-10 flex w-full flex-col items-center md:contents">
        <p
          ref={seasonRef}
          aria-hidden="true"
          className="font-swiss font-light leading-none tracking-[-0.03em] whitespace-nowrap text-black md:relative md:z-10"
          style={{
            fontSize: "clamp(3rem, 18vw, 25.5rem)",
          }}
        >
          Season 12
        </p>

        <Link
          ref={ctaRef}
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            go("/contact");
          }}
          className="z-20 mt-[0.55em] inline-flex font-swiss text-[clamp(1.05rem,4.2vw,3.1875rem)] font-normal leading-none tracking-[-0.02em] text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black md:absolute md:right-10 md:bottom-14 md:mt-0"
        >
          <span
            ref={magnetRef}
            className="inline-flex items-baseline gap-[0.35em] will-change-transform"
          >
            <span className="leading-none">Train With Us</span>
            <svg
              ref={arrowRef}
              aria-hidden="true"
              viewBox="0 0 44 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-[0.28em] w-[1.2em] shrink-0 self-baseline overflow-visible will-change-transform"
            >
              <path
                d="M1 5H41M41 5L34.5 1M41 5L34.5 9"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}

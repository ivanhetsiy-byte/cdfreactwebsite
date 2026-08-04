"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import SplitType from "split-type";

import { LightRays } from "@/components/backgrounds/LightRays";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

/**
 * Concept 2 — Proximity Field
 * Immersive micro-interactions: pointer parallax depth layers, magnetic CTA,
 * proximity-reactive LIVE, and letter-level brand reveal with hover breath.
 */
export function HeroConcept2() {
  const go = useDelayedNavigation();
  const rootRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLParagraphElement>(null);
  const layerFarRef = useRef<HTMLDivElement>(null);
  const layerMidRef = useRef<HTMLDivElement>(null);
  const layerNearRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const seasonRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const brand = brandRef.current;
    if (!root || !brand) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const split = new SplitType(brand, { types: "chars" });
    const chars = (split.chars ?? []) as HTMLElement[];

    chars.forEach((ch) => {
      ch.style.display = "inline-block";
      ch.style.willChange = "transform";
    });

    if (reduced) {
      return () => {
        split.revert();
      };
    }

    const live = liveRef.current;
    const support = supportRef.current;
    const season = seasonRef.current;
    const cta = ctaRef.current;
    const ctaWrap = ctaWrapRef.current;
    const far = layerFarRef.current;
    const mid = layerMidRef.current;
    const near = layerNearRef.current;

    const ctx = gsap.context(() => {
      gsap.set(chars, { yPercent: 120, opacity: 0 });
      if (live) gsap.set(live, { scale: 0.92, opacity: 0 });
      if (support) gsap.set(support, { opacity: 0, y: 16 });
      if (season) gsap.set(season, { opacity: 0, y: -12 });
      if (cta) gsap.set(cta, { opacity: 0, scale: 0.9 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(season, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
        .to(chars, { yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.028 }, 0.2)
        .to(live, { scale: 1, opacity: 1, duration: 0.85 }, 0.55)
        .to(support, { opacity: 1, y: 0, duration: 0.65 }, 0.7)
        .to(cta, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" }, 0.85);
    }, root);

    const xFar = far ? gsap.quickTo(far, "x", { duration: 0.9, ease: "power3" }) : null;
    const yFar = far ? gsap.quickTo(far, "y", { duration: 0.9, ease: "power3" }) : null;
    const xMid = mid ? gsap.quickTo(mid, "x", { duration: 0.65, ease: "power3" }) : null;
    const yMid = mid ? gsap.quickTo(mid, "y", { duration: 0.65, ease: "power3" }) : null;
    const xNear = near ? gsap.quickTo(near, "x", { duration: 0.4, ease: "power3" }) : null;
    const yNear = near ? gsap.quickTo(near, "y", { duration: 0.4, ease: "power3" }) : null;
    const ctaX = cta ? gsap.quickTo(cta, "x", { duration: 0.45, ease: "power3" }) : null;
    const ctaY = cta ? gsap.quickTo(cta, "y", { duration: 0.45, ease: "power3" }) : null;

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      xFar?.(nx * -28);
      yFar?.(ny * -18);
      xMid?.(nx * -14);
      yMid?.(ny * -10);
      xNear?.(nx * 10);
      yNear?.(ny * 8);

      if (live) {
        const liveRect = live.getBoundingClientRect();
        const lx = liveRect.left + liveRect.width / 2;
        const ly = liveRect.top + liveRect.height / 2;
        const dist = Math.hypot(e.clientX - lx, e.clientY - ly);
        const prox = gsap.utils.clamp(0, 1, 1 - dist / 280);
        gsap.to(live, {
          scale: 1 + prox * 0.08,
          letterSpacing: `${-0.04 + prox * 0.06}em`,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      chars.forEach((ch) => {
        const r = ch.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(e.clientX - cx, e.clientY - cy);
        const p = gsap.utils.clamp(0, 1, 1 - d / 140);
        gsap.to(ch, {
          y: -p * 10,
          scale: 1 + p * 0.12,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      if (cta && ctaWrap && ctaX && ctaY) {
        const br = ctaWrap.getBoundingClientRect();
        const bx = br.left + br.width / 2;
        const by = br.top + br.height / 2;
        const dx = e.clientX - bx;
        const dy = e.clientY - by;
        const d = Math.hypot(dx, dy);
        if (d < 160) {
          ctaX(dx * 0.28);
          ctaY(dy * 0.28);
        } else {
          ctaX(0);
          ctaY(0);
        }
      }
    };

    const onLeave = () => {
      xFar?.(0);
      yFar?.(0);
      xMid?.(0);
      yMid?.(0);
      xNear?.(0);
      yNear?.(0);
      ctaX?.(0);
      ctaY?.(0);
      if (live) {
        gsap.to(live, {
          scale: 1,
          letterSpacing: "-0.04em",
          duration: 0.5,
          ease: "power3.out",
        });
      }
      gsap.to(chars, { y: 0, scale: 1, duration: 0.5, ease: "power3.out" });
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      ctx.revert();
      split.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-concept-2-heading"
      className="relative flex min-h-dvh w-full cursor-default overflow-x-clip overflow-y-hidden bg-black text-white"
    >
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="bottom-center"
          raysColor="#ffffff"
          raysSpeed={0.8}
          lightSpread={0.8}
          fadeDistance={0.7}
          saturation={1.7}
          followMouse={false}
        />
      </div>

      <h1 id="hero-concept-2-heading" className="sr-only">
        Childrens Dance Factory — Season 12 now live
      </h1>

      <div className="relative z-10 flex min-h-dvh w-full flex-col justify-between px-6 pt-28 pb-10 md:px-10 md:pt-36 md:pb-14">
        <div ref={layerFarRef} className="will-change-transform">
          <p
            ref={seasonRef}
            aria-hidden="true"
            className="font-swiss text-[0.65rem] font-bold tracking-[0.5em] uppercase text-white/70"
          >
            Season 12
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div ref={layerMidRef} className="will-change-transform">
            <p
              ref={brandRef}
              aria-hidden="true"
              className="font-swiss max-w-[11ch] overflow-hidden font-bold leading-[0.88] tracking-[-0.06em]"
              style={{ fontSize: "clamp(3.25rem, 9.5vw, 8.5rem)" }}
            >
              Childrens Dance Factory
            </p>
          </div>

          <div
            ref={layerNearRef}
            className="mt-[min(12vh,6rem)] flex items-end justify-between gap-8 will-change-transform"
          >
            <p
              ref={supportRef}
              aria-hidden="true"
              className="max-w-[16ch] font-swiss text-[0.875rem] font-light leading-[1.4] tracking-[-0.01em] text-white/75 md:text-[1rem]"
            >
              Enrollment is open. Step into the light.
            </p>

            <p
              ref={liveRef}
              aria-hidden="true"
              className="font-swiss shrink-0 font-bold italic leading-none tracking-[-0.04em] select-none"
              style={{ fontSize: "clamp(3rem, 10vw, 7.5rem)" }}
            >
              LIVE
              <span className="ml-[0.05em] inline-block h-[1cap] w-[0.03em] origin-bottom bg-white align-baseline [transform:skewX(-12deg)] motion-safe:animate-[caret-blink_1.1s_linear_infinite]" />
            </p>
          </div>
        </div>

        <div ref={ctaWrapRef} className="flex justify-end">
          <Link
            ref={ctaRef}
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              go("/contact");
            }}
            className="font-swiss inline-flex h-14 min-w-[11rem] items-center justify-center border-2 border-white bg-white px-8 text-[0.9375rem] font-bold tracking-tight text-black will-change-transform transition-colors duration-700 ease-out hover:bg-black hover:text-white md:h-16 md:min-w-[13rem] md:text-base"
          >
            Train with Us
          </Link>
        </div>
      </div>
    </section>
  );
}

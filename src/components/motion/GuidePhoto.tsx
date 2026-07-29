"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

type GuidePhotoProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * Photo that fades in (opacity + slight rise) as the guide line's drawn tip
 * reaches it. Geometry comes from className. Desktop only — hidden on mobile
 * where the SVG guide is hidden.
 */
export function GuidePhoto({ src, alt, className = "" }: GuidePhotoProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, { opacity: 1, yPercent: 0 });
      return;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, yPercent: 8 },
      {
        opacity: 1,
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          end: "top 55%",
          scrub: 0.6,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-none relative hidden overflow-hidden md:block ${className}`}
      aria-hidden
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 0px, 16vw"
        className="object-cover"
        quality={80}
      />
    </div>
  );
}

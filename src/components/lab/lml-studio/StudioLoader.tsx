"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/layout/Logo";

type Props = {
  onDone: () => void;
};

/** Kinetic mark — dual rings + diamond pulse keyed to load progress. */
function LoaderCore({ progress }: { progress: number }) {
  const t = progress / 100;
  const outerDash = 220;
  const outerOffset = outerDash * (1 - t);
  const innerDash = 140;
  const innerOffset = innerDash * (1 - t);

  return (
    <div
      className="relative flex h-32 w-32 items-center justify-center md:h-40 md:w-40"
      aria-hidden="true"
    >
      <div
        className="absolute inset-[18%] rounded-full bg-white/5 blur-xl transition-opacity duration-300"
        style={{ opacity: 0.25 + t * 0.55 }}
      />

      <svg viewBox="0 0 100 100" className="loader-spin absolute inset-0 h-full w-full">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.75"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="square"
          strokeDasharray={`${outerDash * 0.28} ${outerDash}`}
          strokeDashoffset={outerOffset}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
          transform="rotate(-90 50 50)"
        />
      </svg>

      <svg
        viewBox="0 0 100 100"
        className="loader-spin-rev absolute inset-[12%] h-[76%] w-[76%]"
      >
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.6"
          strokeDasharray="4 6"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1"
          strokeLinecap="square"
          strokeDasharray={`${innerDash * 0.2} ${innerDash}`}
          strokeDashoffset={-innerOffset}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
          transform="rotate(90 50 50)"
        />
      </svg>

      <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-white/70 md:h-4 md:w-4" />
      <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-white/70 md:h-4 md:w-4" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/70 md:h-4 md:w-4" />
      <span className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-white/70 md:h-4 md:w-4" />

      <div
        className="h-3 w-3 border border-white bg-white/10 md:h-3.5 md:w-3.5"
        style={{
          transform: `rotate(45deg) scale(${0.55 + t * 0.7})`,
          opacity: 0.45 + t * 0.55,
        }}
      />
    </div>
  );
}

export function StudioLoader({ onDone }: Props) {
  const [count, setCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setCount(100);
      onDone();
      return;
    }

    const obj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        if (doneRef.current) return;
        doneRef.current = true;
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.55,
          ease: "power2.inOut",
          onComplete: onDone,
        });
      },
    });

    tl.to(obj, {
      v: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => setCount(Math.round(obj.v)),
    });

    return () => {
      tl.kill();
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none! fixed inset-0 z-[99999999] flex items-center justify-center bg-black text-white"
      aria-hidden={count >= 100}
    >
      <div className="absolute top-5 left-5 md:top-6.5 md:left-6.5">
        <div className="h-[calc(min(22vw,160px)*179/467)] w-auto md:h-[calc(min(12vw,140px)*179/467)]">
          <Logo className="!h-full" forceWhite />
        </div>
      </div>

      <LoaderCore progress={count} />

      <div className="absolute right-5 bottom-5 font-medium tabular-nums md:right-6.5 md:bottom-6.5">
        <span className="text-[clamp(3rem,8vw,5rem)] leading-none">
          {String(count).padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}

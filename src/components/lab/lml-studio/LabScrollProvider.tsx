"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { shouldSkipSmoothScroll } from "@/lib/motion-env";

gsap.registerPlugin(ScrollTrigger);

type LenisWindow = Window & { lenis: Lenis };

export function LabScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    const skipSmooth = shouldSkipSmoothScroll();

    if (skipSmooth) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }

    const instance = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    (window as unknown as LenisWindow).lenis = instance;

    // Keep ScrollTrigger in sync with Lenis (window scroll).
    instance.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(ticker);

    document.documentElement.classList.add("lenis");

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(ticker);
      instance.destroy();
      document.documentElement.classList.remove("lenis");
      const win = window as unknown as LenisWindow;
      if (win.lenis === instance) {
        (window as Window & { lenis: Record<string, unknown> }).lenis = {};
      }
    };
  }, []);

  return <>{children}</>;
}

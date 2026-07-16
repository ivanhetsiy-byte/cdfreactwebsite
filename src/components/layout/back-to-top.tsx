"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { getLenis, quinticEase } from "@/lib/lenis";

export function BackToTop() {
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let rafId = 0;
    let cancelled = false;

    const onScroll = (scroll: { animatedScroll: number }) => {
      setShowTopButton(scroll.animatedScroll > 400);
    };

    const attach = () => {
      if (cancelled) return;
      const lenis = getLenis();
      if (lenis && typeof lenis.on === "function") {
        unsubscribe = lenis.on("scroll", onScroll);
        onScroll(lenis);
        return;
      }
      rafId = requestAnimationFrame(attach);
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      unsubscribe?.();
    };
  }, []);

  return (
    <div
      className={`fixed bottom-10 right-6 md:right-10 z-50 flex flex-col items-center gap-2 transition-all duration-500 ease-out pointer-events-none ${showTopButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <button
        type="button"
        aria-label="Back to top"
        className={`pointer-events-auto flex flex-col items-center hover:opacity-60 transition-opacity duration-150 swiss-no-select ${showTopButton ? "" : "!pointer-events-none"}`}
        onClick={() => {
          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(0, { duration: 2.8, easing: quinticEase });
          }
        }}
      >
        <ArrowUp className="w-4 h-4 text-black dark:text-white stroke-[1.5px]" aria-hidden />
        <span className="font-swiss-compressed font-bold text-xs uppercase tracking-widest text-black dark:text-white select-none -rotate-90 origin-center mt-2">
          TOP
        </span>
      </button>
    </div>
  );
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

export default function NotFound() {
  const { t } = useLanguage();
  const go = useDelayedNavigation();

  return (
    <main
      id="main-content"
      className="relative min-h-screen w-full bg-background px-6 pb-24 pt-32 font-swiss-compressed text-foreground md:p-10 md:pt-44"
    >
      {/* Geometric grid — absolute-locked Swiss canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute top-0 left-0 h-px w-full bg-black/10 dark:bg-white/10" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-black/10 dark:bg-white/10" />
        <div className="absolute top-0 left-0 h-full w-px bg-black/10 dark:bg-white/10" />
        <div className="absolute top-0 right-0 h-full w-px bg-black/10 dark:bg-white/10" />
        <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-black/10 dark:bg-white/10" />
        <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-black/10 dark:bg-white/10" />
      </div>

      {/* Massive 404 numeral — locked to viewport center */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <h1 className="text-[28vw] font-black leading-none tracking-tighter md:text-[22vw]">
          404
        </h1>
      </div>

      {/* Inverted back-to-home CTA */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center p-6 md:p-10">
        <button
          type="button"
          onClick={() => go("/")}
          className="inline-flex items-center justify-center border-2 border-black bg-black px-8 py-3 font-swiss text-sm font-bold uppercase tracking-widest text-white transition-colors duration-150 hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
        >
          {t.notFound.backToHome}
        </button>
      </div>
    </main>
  );
}

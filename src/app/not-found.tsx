"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

import { useLanguage } from "@/context/LanguageContext";
import { requestRouteCover } from "@/lib/route-cover";

export default function NotFound() {
  const router = useRouter();
  const { t } = useLanguage();
  const navLockRef = useRef(false);

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (navLockRef.current) return;

    navLockRef.current = true;

    if (targetPath === "/") {
      sessionStorage.setItem("fromSubpage", "true");
    }

    requestRouteCover();

    // Wait exactly 500ms for the black curtain to reach full opacity,
    // then switch the route behind the mask so the viewer never sees the swap
    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, 500);
  };

  return (
    <main
      id="main-content"
      className="swiss-no-select relative min-h-screen w-full bg-white px-6 pb-24 pt-32 font-swiss-compressed text-black dark:bg-black dark:text-white md:p-10 md:pt-44"
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
          onClick={() => handleDelayedNavigation("/")}
          className="inline-flex items-center justify-center border-2 border-black bg-black px-8 py-3 font-swiss text-sm font-bold uppercase tracking-widest text-white transition-colors duration-150 hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
        >
          {t.notFound.backToHome}
        </button>
      </div>
    </main>
  );
}

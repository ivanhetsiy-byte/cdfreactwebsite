"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { requestRouteCover } from "@/lib/route-cover";

/**
 * Season and LIVE are sized independently.
 * LIVE keeps the prior root-em scale: (100vw - 5rem) / 6.58 → LIVE @ 1.598em.
 * Season scales to the content container (100cqi / 6.55) so the skewed
 * “now” stays inside the padded viewport on mobile and desktop.
 */
export function Hero() {
  const router = useRouter();
  const pathname = usePathname();
  const navLockRef = useRef(false);

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) return;
    if (navLockRef.current) return;

    navLockRef.current = true;
    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, 500);
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100dvh-11rem)] w-full items-center justify-center overflow-x-clip overflow-y-hidden bg-white text-black dark:bg-black dark:text-white md:min-h-[calc(100dvh-13rem)]"
    >
      <div className="@container flex w-full flex-col">
        {/* Season 12 now — sized to container so “now” (incl. skew) never clips */}
        <p
          className="font-swiss font-bold leading-[0.926] tracking-[-0.06em] whitespace-nowrap"
          style={{
            fontSize: "clamp(1.75rem, calc(100cqi / 6.55), 20.0625rem)",
          }}
        >
          Season 12{" "}
          <span className="inline-block origin-bottom-left font-light not-italic [transform:skewX(-12deg)]">
            now
          </span>
        </p>

        {/* LIVE band — prior scale locked; em children relative to this root only */}
        <div
          className="group/hero relative mx-auto mt-[0.08em] w-[min(100%,3.79em)]"
          style={{
            fontSize: "clamp(1.85rem, calc((100vw - 5rem) / 6.58), 20.0625rem)",
          }}
        >
          <div className="relative flex items-center justify-center bg-[#ff0100] py-[0.02em] transition-[filter] duration-700 ease-out group-has-[a:hover]/hero:invert">
            <h1
              id="hero-heading"
              className="font-swiss flex items-center text-[1.598em] font-bold leading-[1.065] tracking-tighter text-black select-none"
            >
              LIVE
              <span
                aria-hidden
                className="ml-[0.03em] inline-block h-[1cap] w-[0.035em] shrink-0 self-center bg-current animate-[caret-blink_1.1s_linear_infinite]"
              />
            </h1>
          </div>

          {/* CTA — overlaps bar bottom-right; slightly past bar edge */}
          <div className="relative z-10 -mt-[0.2em] -mr-[0.24em] flex justify-end">
            <Link
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                handleDelayedNavigation("/contact");
              }}
              className="inline-flex h-[max(2.75rem,0.445em)] w-[max(7.5rem,1.486em)] items-center justify-center border-2 border-black bg-black font-swiss font-bold text-white transition-colors duration-700 ease-out hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
            >
              <span className="text-[max(0.9375rem,0.153em)] leading-[1.065] tracking-tight">
                Train with Us
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

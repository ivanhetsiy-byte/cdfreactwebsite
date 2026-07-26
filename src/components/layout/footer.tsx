"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { SocialLinks } from "@/components/layout/social-links";
import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";

/**
 * Site-wide closing footer — large type CTA + sparse studio details.
 * Colors follow the site theme (light / dark), except Staff which stays black
 * to match the forced-dark page above it.
 */
export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const year = new Date().getFullYear();
  const forceDark =
    pathname === "/staff" ||
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname === "/bag";

  const go = (targetPath: string) => {
    if (targetPath === pathname || navLockRef.current) return;
    navLockRef.current = true;
    if (targetPath === "/") sessionStorage.setItem("fromSubpage", "true");
    requestRouteCover();
    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, ROUTE_COVER_MS);
  };

  const cta =
    pathname === "/contact"
      ? { href: "/about", left: "Learn more", right: "→ About" }
      : pathname === "/about"
        ? { href: "/classes", left: "Check Out", right: "→ Classes" }
        : { href: "/contact", left: "Train", right: "→ Contact" };

  return (
    <footer
      aria-label="Footer"
      className={
        forceDark
          ? "relative z-10 w-full bg-black text-white"
          : "relative z-10 w-full bg-white text-black dark:bg-black dark:text-white"
      }
    >
      <Link
        href={cta.href}
        onClick={(e) => {
          e.preventDefault();
          go(cta.href);
        }}
        className={
          forceDark
            ? "group relative z-10 flex h-[110px] w-full cursor-pointer items-center justify-between border-t border-b border-white/20 bg-black px-5 text-white transition-colors duration-300 hover:border-[#C31716] hover:bg-[#C31716] md:h-[150px] md:px-8 lg:px-10"
            : "group relative z-10 flex h-[110px] w-full cursor-pointer items-center justify-between border-t border-b border-black/20 bg-white px-5 text-black transition-colors duration-300 hover:border-[#C31716] hover:bg-[#C31716] hover:text-white dark:border-white/20 dark:bg-black dark:text-white md:h-[150px] md:px-8 lg:px-10"
        }
      >
        <span className="font-swiss text-[2.25rem] leading-none font-medium tracking-tight md:text-[4rem]">
          {cta.left}
        </span>
        <span className="font-swiss text-[2.25rem] leading-none font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-[-10px] md:text-[4rem]">
          {cta.right}
        </span>
      </Link>

      <div className="flex flex-col gap-10 px-5 pt-12 pb-24 md:flex-row md:items-end md:justify-between md:gap-16 md:px-8 md:pt-16 md:pb-28 lg:px-10">
        <div className="max-w-xl">
          <p
            className={
              forceDark
                ? "mb-3 font-swiss text-[0.7rem] tracking-[0.2em] text-white/40 uppercase"
                : "mb-3 font-swiss text-[0.7rem] tracking-[0.2em] text-black/40 uppercase dark:text-white/40"
            }
          >
            Child Dance Factory
          </p>
          <a
            href="mailto:info@cdf.studio"
            className="block font-swiss text-[1.75rem] leading-none tracking-tight transition-opacity hover:opacity-70 md:text-[2.5rem]"
          >
            info@cdf.studio
          </a>
          <p
            className={
              forceDark
                ? "mt-5 font-swiss text-[0.95rem] leading-relaxed text-white/45 md:text-[1.1rem]"
                : "mt-5 font-swiss text-[0.95rem] leading-relaxed text-black/45 dark:text-white/45 md:text-[1.1rem]"
            }
          >
            10100 Jamison Ave
            <br />
            Philadelphia, PA 19116
          </p>
          <a
            href="tel:+19292488120"
            className={
              forceDark
                ? "mt-4 inline-block font-swiss text-[0.95rem] text-white/55 transition-opacity hover:opacity-80 md:text-[1.1rem]"
                : "mt-4 inline-block font-swiss text-[0.95rem] text-black/55 transition-opacity hover:opacity-80 dark:text-white/55 md:text-[1.1rem]"
            }
          >
            929-248-8120
          </a>
        </div>

        <div className="flex flex-col gap-8 md:items-end">
          <SocialLinks iconGap="gap-4 md:gap-5" />
          <p
            className={
              forceDark
                ? "font-swiss text-[0.75rem] tracking-tight text-white/30 md:text-right"
                : "font-swiss text-[0.75rem] tracking-tight text-black/30 dark:text-white/30 md:text-right"
            }
          >
            © {year} CDF, LLC · Always to the top
          </p>
        </div>
      </div>
    </footer>
  );
}

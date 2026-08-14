"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { SocialLinks } from "@/components/layout/social-links";
import { StudioEmailText, STUDIO_EMAIL } from "@/components/ui/studio-email";
import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";

/**
 * Site-wide closing footer — large type CTA + sparse studio details.
 * Colors follow the site theme (light / dark), except Store/Bag which stay
 * black to match their forced-dark pages.
 */
export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const year = new Date().getFullYear();
  const forceDark =
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname === "/bag";

  const go = (targetPath: string) => {
    if (targetPath === pathname || navLockRef.current) return;
    navLockRef.current = true;
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
        : pathname === "/classes"
          ? { href: "/contact", left: "Send Us a Message", right: "→ Contact" }
          : { href: "/contact", left: "Train", right: "→ Contact" };

  const isClasses = pathname === "/classes";

  return (
    <footer
      aria-label="Footer"
      className={
        forceDark
          ? "relative z-10 w-full bg-black text-white"
          : "relative z-10 w-full bg-white text-black dark:bg-black dark:text-white"
      }
    >
      {isClasses ? (
        <p
          className={
            forceDark
              ? "relative z-20 w-full whitespace-nowrap px-5 text-right font-swiss text-[clamp(1.85rem,calc((100vw-2.5rem)/7.2),16rem)] leading-none font-bold tracking-tighter text-white md:px-8 md:text-[clamp(2.75rem,calc((100vw-4rem)/8),16rem)] lg:px-10 -mb-[0.23em]"
              : "relative z-20 w-full whitespace-nowrap px-5 text-right font-swiss text-[clamp(1.85rem,calc((100vw-2.5rem)/7.2),16rem)] leading-none font-bold tracking-tighter text-black dark:text-white md:px-8 md:text-[clamp(2.75rem,calc((100vw-4rem)/8),16rem)] lg:px-10 -mb-[0.23em]"
          }
        >
          Ready to Train?
        </p>
      ) : null}

      <Link
        href={cta.href}
        onClick={(e) => {
          e.preventDefault();
          go(cta.href);
        }}
        className={
          forceDark
            ? "group relative z-10 flex h-[110px] w-full cursor-pointer items-center justify-between gap-3 border-t border-b border-white/20 bg-black px-5 text-white transition-colors duration-300 hover:border-brand-red hover:bg-brand-red md:h-[150px] md:px-8 lg:px-10"
            : "group relative z-10 flex h-[110px] w-full cursor-pointer items-center justify-between gap-3 border-t border-b border-black/20 bg-white px-5 text-black transition-colors duration-300 hover:border-brand-red hover:bg-brand-red hover:text-white dark:border-white/20 dark:bg-black dark:text-white md:h-[150px] md:px-8 lg:px-10"
        }
      >
        <span className="min-w-0 font-swiss text-[2.25rem] leading-none font-medium tracking-tight md:text-[4rem]">
          {isClasses ? (
            <>
              <span className="md:hidden">Message Us</span>
              <span className="hidden md:inline">{cta.left}</span>
            </>
          ) : (
            cta.left
          )}
        </span>
        <span className="shrink-0 font-swiss text-[2.25rem] leading-none font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-[-10px] md:text-[4rem]">
          {isClasses ? (
            <>
              <span className="md:hidden">Contact→</span>
              <span className="hidden md:inline">{cta.right}</span>
            </>
          ) : (
            cta.right
          )}
        </span>
      </Link>

      <div className="flex flex-col gap-10 px-5 pt-12 pb-24 md:flex-row md:items-end md:justify-between md:gap-16 md:px-8 md:pt-16 md:pb-28 lg:px-10">
        <div className="max-w-xl">
          <p
            className={
              forceDark
                ? "type-eyebrow mb-3 text-[0.7rem] text-white/40"
                : "type-eyebrow mb-3 text-[0.7rem] text-black/40 dark:text-white/40"
            }
          >
            Childrens Dance Factory
          </p>
          <a
            href={`mailto:${STUDIO_EMAIL}`}
            className="block whitespace-nowrap font-swiss text-[1.75rem] leading-[1.15] tracking-tight transition-opacity hover:opacity-70 md:text-[2.5rem]"
          >
            <StudioEmailText />
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

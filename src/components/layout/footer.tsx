"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { Logo } from "@/components/layout/Logo";
import { SocialLinks } from "@/components/layout/social-links";
import { useLanguage } from "@/context/LanguageContext";
import { requestRouteCover } from "@/lib/route-cover";

const FOOTER_LINKS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
  { key: "contact" as const, href: "/contact" },
];

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const navLockRef = useRef(false);
  const year = new Date().getFullYear();

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) return;
    if (navLockRef.current) return;

    navLockRef.current = true;

    if (targetPath === "/") {
      sessionStorage.setItem("fromSubpage", "true");
    }

    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, 500);
  };

  return (
    <footer className="relative w-full border-t-2 border-black bg-white text-black dark:border-white dark:bg-black dark:text-white">
      <div className="px-6 py-10 md:px-10 md:py-14">
        <div className="grid grid-cols-6 gap-0 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-6 flex items-center border-b border-black/20 pb-8 dark:border-white/20 md:col-span-5 md:border-b-0 md:pb-0 lg:col-span-6">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleDelayedNavigation("/");
              }}
              className="swiss-no-select inline-flex h-16 w-fit items-center md:h-28 lg:h-32"
              aria-label="CDF home"
            >
              <Logo className="!h-full" />
            </Link>
          </div>

          {/* Explore */}
          <div className="col-span-3 flex flex-col gap-4 border-r border-black/20 py-8 pr-4 dark:border-white/20 md:col-span-4 md:border-r-0 md:py-0 md:pr-0 lg:col-span-3">
            <p className="font-swiss text-xs font-medium tracking-[0.18em] text-[#666666] uppercase md:text-[11px] md:tracking-[0.2em]">
              {t.footer.explore}
            </p>
            <nav aria-label={t.footer.explore}>
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelayedNavigation(link.href);
                        }}
                        className={`font-swiss text-sm uppercase tracking-widest transition-colors duration-150 md:text-[15px] ${
                          active
                            ? "font-black text-black dark:text-white"
                            : "font-medium text-[#666666] hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {t.nav[link.key]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Follow */}
          <div className="col-span-3 flex flex-col justify-between gap-8 py-8 pl-4 md:col-span-3 md:py-0 md:pl-0 lg:col-span-3">
            <div className="flex flex-col gap-4">
              <p className="font-swiss text-xs font-medium tracking-[0.18em] text-[#666666] uppercase md:text-[11px] md:tracking-[0.2em]">
                {t.footer.follow}
              </p>
              <SocialLinks iconGap="gap-4 md:gap-5" />
            </div>

            <p className="font-swiss text-xs font-medium tracking-[0.16em] text-[#666666] uppercase md:text-[11px] md:tracking-[0.18em]">
              {t.footer.rights.replace("{year}", String(year))}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black px-6 py-3.5 dark:border-white md:px-10 md:py-3">
        <span
          aria-hidden="true"
          className="swiss-diamond h-2 w-2 bg-black dark:bg-white"
        />
        <span className="font-swiss text-[11px] font-medium tracking-[0.22em] text-[#666666] uppercase md:text-[10px] md:tracking-[0.25em]">
          CDF — {year}
        </span>
        <span
          aria-hidden="true"
          className="swiss-diamond h-2 w-2 bg-black dark:bg-white"
        />
      </div>
    </footer>
  );
}

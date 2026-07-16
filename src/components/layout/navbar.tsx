"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { SettingsSidebar } from "@/components/layout/SettingsSidebar";
import { useLanguage } from "@/context/LanguageContext";
import { requestRouteCover } from "@/lib/route-cover";

const NAV_HREFS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
  { key: "contact" as const, href: "/contact" },
];

function navLinkClass(active: boolean) {
  return `shrink-0 font-swiss uppercase tracking-widest transition-all duration-150 pointer-events-auto ${
    active
      ? "font-black text-black dark:text-white"
      : "font-medium text-[#666666] hover:text-black dark:hover:text-white"
  }`;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const navLockRef = useRef(false);
  const [activeIndicator, setActiveIndicator] = useState(pathname);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setActiveIndicator(pathname);
  }, [pathname]);

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) return;
    if (navLockRef.current) return;

    navLockRef.current = true;
    setSettingsOpen(false);

    // 1. Instantly snap the active navbar highlight state text weight
    setActiveIndicator(targetPath);

    if (targetPath === "/") {
      sessionStorage.setItem("fromSubpage", "true");
    }

    // Fade the black curtain up before the route swap
    requestRouteCover();

    // 2. Wait exactly 500ms for the black curtain to reach full opacity,
    // then switch the route behind the mask so the viewer never sees the swap
    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, 500);
  };

  return (
    <>
      <header className="absolute top-0 left-0 z-30 flex w-full items-center justify-between bg-transparent p-6 text-black dark:text-white pointer-events-auto md:p-10">
        {/* Logo — official Figma vectors, theme-swapped (black ↔ white) */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleDelayedNavigation("/");
          }}
          className="swiss-no-select relative z-10 flex h-[87px] w-auto shrink-0 items-center pointer-events-auto"
          aria-label="CDF home"
        >
          <Logo />
        </Link>

        {/* Navigation 62:48 — Helvetica 20px, gap 16px, viewport-centered baseline */}
        <nav
          aria-label="Main navigation"
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4 whitespace-nowrap font-swiss text-sm uppercase leading-none md:gap-4 md:text-[20px]"
        >
          {NAV_HREFS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleDelayedNavigation(link.href);
              }}
              className={navLinkClass(activeIndicator === link.href)}
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>

        {/* Far-right settings trigger — mirrors logo footprint for true nav centering */}
        <div className="relative z-10 flex h-8 w-[calc(2rem*104/77)] shrink-0 items-center justify-end pointer-events-auto">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center justify-center leading-none"
            aria-label={t.nav.settings}
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
          >
            <svg
              className={`w-5 h-5 transition-colors duration-150 cursor-pointer select-none swiss-no-select ${
                settingsOpen
                  ? "text-black dark:text-white"
                  : "text-[#666666] hover:text-black dark:hover:text-white"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              aria-hidden="true"
            >
              {/* Top Row Slider Track and Adjustment Block */}
              <line x1="4" y1="8" x2="16" y2="8" />
              <circle cx="18" cy="8" r="2" fill="currentColor" />

              {/* Bottom Row Slider Track and Adjustment Block */}
              <circle cx="6" cy="16" r="2" fill="currentColor" />
              <line x1="8" y1="16" x2="20" y2="16" />
            </svg>
          </button>
        </div>
      </header>

      <SettingsSidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

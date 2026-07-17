"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { SettingsContent } from "@/components/layout/SettingsContent";
import { SettingsSidebar } from "@/components/layout/SettingsSidebar";
import { SocialLinks } from "@/components/layout/social-links";
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
  const [desktopSettingsOpen, setDesktopSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSettingsView, setMobileSettingsView] = useState(false);

  useEffect(() => {
    setActiveIndicator(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      setMobileSettingsView(false);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mobileSettingsView) {
        setMobileSettingsView(false);
        return;
      }
      setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, mobileSettingsView]);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileSettingsView(false);
  };

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) {
      closeMenu();
      return;
    }
    if (navLockRef.current) return;

    navLockRef.current = true;
    setDesktopSettingsOpen(false);
    closeMenu();

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

  const openDesktopSettings = () => {
    closeMenu();
    setDesktopSettingsOpen(true);
  };

  const openMobileSettings = () => {
    setMobileSettingsView(true);
  };

  const toggleMenu = () => {
    setDesktopSettingsOpen(false);
    if (menuOpen) {
      closeMenu();
      return;
    }
    setMenuOpen(true);
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
          className="swiss-no-select relative z-10 flex h-[56px] w-auto min-h-0 shrink-0 items-center overflow-hidden pointer-events-auto md:h-[87px]"
          aria-label="CDF home"
        >
          <Logo className="!h-full" />
        </Link>

        {/* Desktop nav — Helvetica, gap 16px, viewport-centered */}
        <nav
          aria-label="Main navigation"
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-4 whitespace-nowrap font-swiss text-[20px] uppercase leading-none md:flex"
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

        {/* Far-right: mobile menu (md:hidden) + desktop settings */}
        <div className="relative z-10 flex h-[56px] shrink-0 items-center justify-end gap-5 pointer-events-auto md:h-8 md:w-[calc(2rem*104/77)] md:gap-0">
          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex h-full w-[56px] items-center justify-center leading-none md:hidden"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
          >
            <svg
              className={`h-8 w-8 transition-colors duration-150 cursor-pointer select-none swiss-no-select ${
                menuOpen
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
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>

          <button
            type="button"
            onClick={openDesktopSettings}
            className="hidden h-11 w-11 items-center justify-center leading-none md:inline-flex md:h-auto md:w-auto"
            aria-label={t.nav.settings}
            aria-expanded={desktopSettingsOpen}
            aria-haspopup="dialog"
          >
            <svg
              className={`h-7 w-7 transition-colors duration-150 cursor-pointer select-none swiss-no-select ${
                desktopSettingsOpen
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
              <line x1="4" y1="8" x2="16" y2="8" />
              <circle cx="18" cy="8" r="2" fill="currentColor" />
              <circle cx="6" cy="16" r="2" fill="currentColor" />
              <line x1="8" y1="16" x2="20" y2="16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <button
        type="button"
        aria-label={t.nav.closeMenu}
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-500 ease-out md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        id="mobile-nav-menu"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        className={`fixed top-0 right-0 z-50 flex h-screen w-full max-w-[320px] flex-col bg-white p-6 text-black shadow-2xl transition-transform duration-500 ease-out dark:bg-black dark:text-white border-l border-black dark:border-white md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (mobileSettingsView) {
              setMobileSettingsView(false);
              return;
            }
            closeMenu();
          }}
          className="absolute top-6 right-6 z-10 font-swiss uppercase text-xs tracking-widest text-black dark:text-white hover:opacity-60 transition-opacity duration-150"
        >
          {t.settings.close}
        </button>

        <div className="relative mt-16 flex min-h-0 flex-1 flex-col">
          {/* Nav links — blur/fade out when settings opens */}
          <div
            className={`flex min-h-0 flex-1 flex-col transition-[opacity,filter] duration-500 ease-out ${
              mobileSettingsView
                ? "pointer-events-none absolute inset-0 opacity-0 blur-sm"
                : "relative opacity-100 blur-0"
            }`}
            aria-hidden={mobileSettingsView}
          >
            <ul className="flex flex-col gap-6">
              {NAV_HREFS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelayedNavigation(link.href);
                    }}
                    className={`block font-swiss text-lg uppercase tracking-widest transition-all duration-150 ${
                      activeIndicator === link.href
                        ? "font-black text-black dark:text-white"
                        : "font-medium text-[#666666] hover:text-black dark:hover:text-white"
                    }`}
                    tabIndex={menuOpen && !mobileSettingsView ? 0 : -1}
                  >
                    {t.nav[link.key]}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-black/20 pt-6 dark:border-white/20">
              <p className="mb-4 font-swiss text-xs font-medium tracking-[0.18em] text-[#666666] uppercase">
                {t.footer.follow}
              </p>
              <SocialLinks iconGap="gap-5" />
            </div>

            <button
              type="button"
              onClick={openMobileSettings}
              className="mt-auto mb-4 ml-auto inline-flex h-12 w-12 items-center justify-center leading-none"
              aria-label={t.nav.settings}
              aria-expanded={mobileSettingsView}
              tabIndex={menuOpen && !mobileSettingsView ? 0 : -1}
            >
              <svg
                className="h-6 w-6 text-[#666666] transition-colors duration-150 cursor-pointer select-none swiss-no-select hover:text-black dark:hover:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                aria-hidden="true"
              >
                <line x1="4" y1="8" x2="16" y2="8" />
                <circle cx="18" cy="8" r="2" fill="currentColor" />
                <circle cx="6" cy="16" r="2" fill="currentColor" />
                <line x1="8" y1="16" x2="20" y2="16" />
              </svg>
            </button>
          </div>

          {/* Settings — blur/fade in within the same drawer */}
          <div
            className={`flex min-h-0 flex-1 flex-col transition-[opacity,filter] duration-500 ease-out ${
              mobileSettingsView
                ? "relative opacity-100 blur-0"
                : "pointer-events-none absolute inset-0 opacity-0 blur-sm"
            }`}
            aria-hidden={!mobileSettingsView}
          >
            <SettingsContent />
          </div>
        </div>
      </nav>

      <SettingsSidebar
        open={desktopSettingsOpen}
        onClose={() => setDesktopSettingsOpen(false)}
      />
    </>
  );
}

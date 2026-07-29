"use client";

import gsap from "gsap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { NavProgressiveBlur } from "@/components/layout/NavProgressiveBlur";
import { useLanguage } from "@/context/LanguageContext";
import { useCompactNavMeasure } from "@/hooks/useCompactNav";
import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";
import {
  OPEN_SITE_MENU_EVENT,
  broadcastSiteMenuState,
} from "@/lib/site-menu";

/** Desktop inline menu — Contact lives only in persistent chrome. */
const NAV_HREFS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
];

/** Mobile LML-style stack — Store in list; Contact is the red pill CTA. */
const MOBILE_NAV_HREFS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
  { key: "store" as const, href: "/store" },
];

/** Title-case labels for LML-style mobile menu (desktop keeps uppercase via CSS). */
const MOBILE_NAV_LABELS: Record<
  (typeof MOBILE_NAV_HREFS)[number]["key"] | "contact" | "store",
  string
> = {
  home: "Home",
  about: "About",
  classes: "Classes",
  staff: "Staff",
  store: "Store",
  contact: "Contact",
};

/**
 * Same outer footprint as lab LML mark.
 * Inner CDF art is cropped/scaled so ink fills that box (no extra downward growth).
 */
const LOGO_HEIGHT_CLASS =
  "h-[calc(min(25vw,220px)*179/467)] md:h-[calc(min(15vw,180px)*179/467)]";

/** Stretch mark so cropped frame’s bottom = last ink pixel. */
const LOGO_IMG_CLASS = "!h-[calc(100%*77/55)] !w-auto !max-h-none !items-start";

/** Chrome pad — top→logo gap. */
const CHROME_PAD_X = "px-5 md:px-6.5";
const CHROME_PAD_Y = "py-4 md:py-6.5";

/** Scroll distance (px) over which nav frost fades in. */
const BLUR_SCROLL_RANGE = 120;

/** Selection-style active mark.
 * Header uses mix-blend-difference, so on light surfaces we paint the
 * channel-inverse of accent red + white text → composites to red + black.
 * Under `.dark` / force-dark pages, true accent + white (difference preserves it). */
const NAV_ACTIVE_MARK =
  "bg-[#3CE8E9] text-white dark:bg-brand-red";

/** Desktop open-menu links — small uppercase. */
function menuLinkClass(active: boolean) {
  return [
    "menu-inline-link relative shrink-0 font-swiss text-sm font-medium uppercase leading-none tracking-widest md:text-base",
    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:transition-[width] after:duration-300 after:ease-out after:content-['']",
    active
      ? `${NAV_ACTIVE_MARK} px-[0.12em] after:w-0`
      : "text-white after:w-0 after:bg-white hover:after:w-full",
  ].join(" ");
}

/** Same as lab StudioHeader Work/Studio — top-aligned with −8px optical nudge. */
const studioLinkClass =
  "relative top-[-8px] inline-block font-medium text-[3.2rem] leading-none text-white transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:content-[''] hover:after:w-full";

function studioLinkClassFor(active: boolean) {
  return [
    "relative top-[-8px] inline-block font-medium text-[3.2rem] leading-none text-white transition-colors",
    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-current after:transition-all after:content-['']",
    active ? "after:w-full" : "after:w-0 hover:after:w-full",
  ].join(" ");
}

/** Open-menu Store — same size/optical nudge as Contact / Close. */
function storeMenuLinkClass(active: boolean) {
  return [
    "menu-store-link relative top-[-8px] inline-block shrink-0 font-medium normal-case leading-none text-white transition-colors",
    "text-[3.2rem]",
    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-current after:transition-[width] after:duration-300 after:ease-out after:content-['']",
    active ? "after:w-full" : "after:w-0 hover:after:w-full",
  ].join(" ");
}

/** Mobile menu sits outside the blended header — true accent colors. */
function mobileMenuLinkClass(active: boolean) {
  return [
    "menu-drop-link block w-full py-6 text-center font-swiss text-[3.5rem] font-medium leading-none tracking-tight transition-colors",
    active ? "text-white" : "text-white opacity-90 hover:opacity-70",
  ].join(" ");
}

function mobileMenuLabelClass(active: boolean) {
  return active ? "bg-brand-red text-white px-[0.12em]" : undefined;
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-7 items-center justify-center" aria-hidden="true">
      <span
        className={`absolute block h-0.5 w-7 bg-current transition-transform duration-300 ease-out ${
          open ? "translate-y-0 rotate-45" : "-translate-y-1.5"
        }`}
      />
      <span
        className={`absolute block h-0.5 w-7 bg-current transition-transform duration-300 ease-out ${
          open ? "translate-y-0 -rotate-45" : "translate-y-1.5"
        }`}
      />
    </span>
  );
}

/** Chrome Menu ↔ Close labels (title case, matches Contact). */
const MENU_TOGGLE_OPEN = "Menu";
const MENU_TOGGLE_CLOSE = "Close";

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function formatEstTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function readScrollY() {
  if (typeof window === "undefined") return 0;
  const lenis = (window as unknown as { lenis?: { scroll?: number } }).lenis;
  if (typeof lenis?.scroll === "number") return lenis.scroll;
  return window.scrollY || document.documentElement.scrollTop || 0;
}

/**
 * Full word always laid out; clip reveals from the right (RTL on open).
 * Caret sits on the reveal edge — right when opening, left when closing.
 */
function TypewriterSlot({
  full,
  typed,
  typing,
}: {
  full: string;
  typed: string;
  typing: boolean;
}) {
  const progress = full.length === 0 ? 0 : typed.length / full.length;
  const clipLeft = (1 - progress) * 100;

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        className="inline-block whitespace-nowrap"
        style={{ clipPath: `inset(0 0 0 ${clipLeft}%)` }}
      >
        {full}
      </span>
      {typing ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-[0.85em] w-[0.08em] -translate-y-1/2 bg-current animate-[caret-blink_1.1s_linear_infinite]"
          style={{ left: `${(1 - progress) * 100}%` }}
        />
      ) : null}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const navLockRef = useRef(false);
  const closingRef = useRef(false);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const storeLinkRef = useRef<HTMLAnchorElement>(null);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const probeBandRef = useRef<HTMLDivElement>(null);
  const contactProbeRef = useRef<HTMLSpanElement>(null);
  const linksProbeRef = useRef<HTMLDivElement>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const requestCloseRef = useRef<() => void>(() => {});
  const [activeIndicator, setActiveIndicator] = useState(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const blurRootRef = useRef<HTMLDivElement>(null);
  const [localTime, setLocalTime] = useState<string | null>(null);
  const navLabels = NAV_HREFS.map((link) => t.nav[link.key]);
  const { compact: useCompactNav, compactRef } = useCompactNavMeasure(
    headerRowRef,
    probeBandRef,
    contactProbeRef,
    linksProbeRef,
    [t.nav.contact, MENU_TOGGLE_CLOSE, ...navLabels],
  );
  const [toggleLabel, setToggleLabel] = useState(MENU_TOGGLE_OPEN);
  const toggleLabelRef = useRef<HTMLSpanElement>(null);
  const toggleFadeRef = useRef<gsap.core.Tween | null>(null);
  /** 0–1 wipe across the whole desktop link row (not per-word). */
  const [linksReveal, setLinksReveal] = useState(0);
  const [linksTyping, setLinksTyping] = useState(false);
  const linksRevealRef = useRef(0);
  const [storeTyped, setStoreTyped] = useState("");
  const [storeTyping, setStoreTyping] = useState(false);
  const typewriterGenRef = useRef(0);
  const storeTypedRef = useRef("");
  const linksTweenRef = useRef<gsap.core.Tween | null>(null);

  const bumpTypewriterGen = () => {
    typewriterGenRef.current += 1;
    return typewriterGenRef.current;
  };

  /** Smooth 0–1 wipe via GSAP. */
  const tweenReveal = (
    to: number,
    onUpdate: (next: number) => void,
    duration = 0.5,
    ease = "power2.inOut",
  ) =>
    new Promise<boolean>((resolve) => {
      linksTweenRef.current?.kill();
      const state = { r: linksRevealRef.current };
      linksTweenRef.current = gsap.to(state, {
        r: to,
        duration,
        ease,
        onUpdate: () => {
          linksRevealRef.current = state.r;
          onUpdate(state.r);
        },
        onComplete: () => {
          linksRevealRef.current = to;
          onUpdate(to);
          resolve(true);
        },
        onInterrupt: () => resolve(false),
      });
    });

  /** Reveal for Store. */
  const typeChars = async (
    full: string,
    onUpdate: (next: string) => void,
    gen: number,
    stepMs = 36,
  ) => {
    if (typewriterGenRef.current !== gen) return false;
    onUpdate("");
    await delay(stepMs);
    for (let i = 1; i <= full.length; i++) {
      if (typewriterGenRef.current !== gen) return false;
      onUpdate(full.slice(0, i));
      await delay(stepMs);
    }
    return typewriterGenRef.current === gen;
  };

  /** Erase Store right → left (must finish before the link wipe on close). */
  const deleteChars = async (
    current: string,
    onUpdate: (next: string) => void,
    gen: number,
    stepMs = 28,
  ) => {
    for (let i = current.length - 1; i >= 0; i--) {
      if (typewriterGenRef.current !== gen) return false;
      onUpdate(current.slice(0, i));
      await delay(stepMs);
    }
    return typewriterGenRef.current === gen;
  };

  useEffect(() => {
    setActiveIndicator(pathname);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("site-nav-compact", useCompactNav);
    return () => document.body.classList.remove("site-nav-compact");
  }, [useCompactNav]);

  useEffect(() => {
    broadcastSiteMenuState(menuOpen);
    return () => broadcastSiteMenuState(false);
  }, [menuOpen]);

  // Simple fade Menu ↔ Close
  useEffect(() => {
    const target = menuOpen ? MENU_TOGGLE_CLOSE : MENU_TOGGLE_OPEN;
    const el = toggleLabelRef.current;

    if (toggleLabel === target) return;

    if (prefersReducedMotion() || !el) {
      setToggleLabel(target);
      if (el) gsap.set(el, { opacity: 1 });
      return;
    }

    toggleFadeRef.current?.kill();
    toggleFadeRef.current = gsap.to(el, {
      opacity: 0,
      duration: 0.16,
      ease: "power1.in",
      onComplete: () => {
        setToggleLabel(target);
        requestAnimationFrame(() => {
          gsap.fromTo(
            el,
            { opacity: 0 },
            { opacity: 1, duration: 0.22, ease: "power1.out" },
          );
        });
      },
    });

    return () => {
      toggleFadeRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to menuOpen
  }, [menuOpen]);

  // Live EST clock for mobile menu footer (LML “locale • time” slot)
  useEffect(() => {
    if (!menuOpen || !useCompactNav) return;
    const tick = () => setLocalTime(formatEstTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [menuOpen, useCompactNav]);

  // Gradual frost — CSS var on blur root (avoids navbar re-renders on scroll)
  useEffect(() => {
    const update = () => {
      const y = readScrollY();
      const p = Math.min(1, Math.max(0, y / BLUR_SCROLL_RANGE));
      blurRootRef.current?.style.setProperty(
        "--nav-blur-progress",
        p.toFixed(4),
      );
    };

    update();

    window.addEventListener("scroll", update, { passive: true });

    type LenisLike = {
      on?: (e: string, cb: () => void) => void;
      off?: (e: string, cb: () => void) => void;
    };
    const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
    lenis?.on?.("scroll", update);

    return () => {
      window.removeEventListener("scroll", update);
      lenis?.off?.("scroll", update);
    };
  }, [pathname]);

  // Keep mobile panel parked above the viewport when closed
  useEffect(() => {
    const panel = mobilePanelRef.current;
    if (!panel) return;
    gsap.set(panel, { yPercent: -100 });
  }, []);

  // External Menu triggers (e.g. lab StudioHeader)
  useEffect(() => {
    const onOpen = () => {
      closingRef.current = false;
      setMenuOpen(true);
    };
    window.addEventListener(OPEN_SITE_MENU_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SITE_MENU_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      requestCloseRef.current();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Open animation — inline: typewriter; compact: full-screen panel
  useEffect(() => {
    if (!menuOpen) return;

    openTlRef.current?.kill();
    linksTweenRef.current?.kill();
    closingRef.current = false;

    const reduced = prefersReducedMotion();
    const inline = !compactRef.current;

    if (inline) {
      if (mobilePanelRef.current) {
        gsap.set(mobilePanelRef.current, { yPercent: -100 });
      }

      const gen = bumpTypewriterGen();

      if (reduced) {
        linksRevealRef.current = 1;
        setLinksReveal(1);
        setLinksTyping(false);
        storeTypedRef.current = t.nav.store;
        setStoreTyped(t.nav.store);
        setStoreTyping(false);
        return;
      }

      linksRevealRef.current = 0;
      setLinksReveal(0);
      setLinksTyping(true);
      storeTypedRef.current = "";
      setStoreTyped("");
      setStoreTyping(false);

      void (async () => {
        // One wipe across the whole link row, right → left
        const ok = await tweenReveal(1, setLinksReveal, 0.55, "power2.out");
        if (!ok || typewriterGenRef.current !== gen) return;
        setLinksTyping(false);

        setStoreTyping(true);
        const storeOk = await typeChars(
          t.nav.store,
          (next) => {
            storeTypedRef.current = next;
            setStoreTyped(next);
          },
          gen,
          40,
        );
        if (!storeOk) return;
        setStoreTyping(false);
      })();

      return () => {
        linksTweenRef.current?.kill();
        if (typewriterGenRef.current === gen) {
          typewriterGenRef.current += 1;
        }
      };
    }

    linksRevealRef.current = 0;
    setLinksReveal(0);
    setLinksTyping(false);
    setStoreTyped("");
    setStoreTyping(false);
    storeTypedRef.current = "";

    const panel = mobilePanelRef.current;
    if (!panel) return;

    const links = Array.from(
      panel.querySelectorAll<HTMLElement>(".menu-drop-link"),
    ).filter((el) => el.getClientRects().length > 0);

    if (reduced) {
      gsap.set(panel, { yPercent: 0 });
      if (links.length) gsap.set(links, { clearProps: "all" });
      return;
    }

    gsap.set(panel, { yPercent: -100 });
    if (links.length) gsap.set(links, { opacity: 0, y: 12 });

    const tl = gsap.timeline();
    openTlRef.current = tl;
    tl.to(panel, {
      yPercent: 0,
      duration: 0.45,
      ease: "power3.out",
    });
    if (links.length) {
      tl.to(
        links,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: "power2.out",
        },
        "-=0.15",
      );
    }

    return () => {
      tl.kill();
      if (openTlRef.current === tl) openTlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t.nav stable enough per open
  }, [menuOpen, useCompactNav]);

  // Lock page scroll only for full-screen compact menu
  useEffect(() => {
    if (!menuOpen || !useCompactNav) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen, useCompactNav]);

  const requestClose = () => {
    if (closingRef.current) return;
    if (!menuOpen) return;

    const reduced = prefersReducedMotion();
    const inline = !compactRef.current;

    if (reduced) {
      bumpTypewriterGen();
      setMenuOpen(false);
      linksRevealRef.current = 0;
      setLinksReveal(0);
      setLinksTyping(false);
      setStoreTyped("");
      setStoreTyping(false);
      return;
    }

    closingRef.current = true;
    openTlRef.current?.kill();

    if (inline) {
      const gen = bumpTypewriterGen();
      linksTweenRef.current?.kill();

      void (async () => {
        // 1) Store fully erases first
        setStoreTyping(true);
        const storeOk = await deleteChars(
          storeTypedRef.current || t.nav.store,
          (next) => {
            storeTypedRef.current = next;
            setStoreTyped(next);
          },
          gen,
          28,
        );
        if (!storeOk || typewriterGenRef.current !== gen) return;
        storeTypedRef.current = "";
        setStoreTyped("");
        setStoreTyping(false);

        // 2) Then the little links wipe out (reverse of open)
        setLinksTyping(true);
        const ok = await tweenReveal(0, setLinksReveal, 0.45, "power2.in");
        if (!ok || typewriterGenRef.current !== gen) return;

        setLinksTyping(false);
        setMenuOpen(false);
        closingRef.current = false;
      })();
      return;
    }

    const panel = mobilePanelRef.current;
    if (!panel) {
      setMenuOpen(false);
      closingRef.current = false;
      return;
    }

    const links = Array.from(
      panel.querySelectorAll<HTMLElement>(".menu-drop-link"),
    ).filter((el) => el.getClientRects().length > 0);

    const tl = gsap.timeline({
      onComplete: () => {
        setMenuOpen(false);
        closingRef.current = false;
        gsap.set(panel, { yPercent: -100 });
      },
    });

    if (links.length) {
      tl.to(links, {
        opacity: 0,
        y: -8,
        duration: 0.18,
        stagger: 0.02,
        ease: "power2.in",
      });
    }
    tl.to(
      panel,
      {
        yPercent: -100,
        duration: 0.4,
        ease: "power3.in",
      },
      links.length ? "-=0.05" : 0,
    );
  };

  useEffect(() => {
    requestCloseRef.current = requestClose;
  });

  // Focus trap + restore for compact (dialog) menu
  useEffect(() => {
    if (!menuOpen || !useCompactNav) return;
    const panel = mobilePanelRef.current;
    if (!panel) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.tabIndex !== -1 && !el.hasAttribute("disabled"));

    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0]!;
      const lastEl = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    panel.addEventListener("keydown", onKeyDown);
    return () => {
      panel.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [menuOpen, useCompactNav]);

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) {
      requestClose();
      return;
    }
    if (navLockRef.current) return;

    navLockRef.current = true;
    closingRef.current = false;
    bumpTypewriterGen();
    openTlRef.current?.kill();
    setMenuOpen(false);
    linksRevealRef.current = 0;
    setLinksReveal(0);
    setLinksTyping(false);
    setStoreTyped("");
    setStoreTyping(false);
    storeTypedRef.current = "";
    if (mobilePanelRef.current) gsap.set(mobilePanelRef.current, { yPercent: -100 });

    setActiveIndicator(targetPath);

    if (targetPath === "/") {
      sessionStorage.setItem("fromSubpage", "true");
    }

    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, ROUTE_COVER_MS);
  };

  const toggleMenu = () => {
    if (menuOpen) {
      requestClose();
      return;
    }
    closingRef.current = false;
    setMenuOpen(true);
  };

  const showBlur = !menuOpen || !useCompactNav;

  return (
    <>
      {/* Hidden probe — mirrors open-menu inline chrome for overflow measurement */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[9999px] opacity-0"
      >
        <div
          ref={probeBandRef}
          className="flex items-end justify-between font-medium"
        >
          <span ref={contactProbeRef} className={studioLinkClassFor(false)}>
            Contact
          </span>
          <div
            ref={linksProbeRef}
            className="flex items-end gap-5 lg:gap-7"
          >
            <ul className="flex flex-nowrap items-end gap-x-4 lg:gap-x-6">
              {NAV_HREFS.map((link) => (
                <li key={link.href} className="shrink-0">
                  <span className={menuLinkClass(false)}>{t.nav[link.key]}</span>
                </li>
              ))}
            </ul>
            <span className={studioLinkClass}>{MENU_TOGGLE_CLOSE}</span>
          </div>
        </div>
      </div>

      {/* LML progressive frost — under chrome, above page; fades in on scroll */}
      {showBlur ? <NavProgressiveBlur rootRef={blurRootRef} /> : null}

      {/* Mobile only — full-screen black menu */}
      <div
        ref={mobilePanelRef}
        id="site-nav-menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menu}
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[1003] bg-black text-white will-change-transform ${
          useCompactNav ? "" : "hidden"
        } ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className="flex h-full flex-col px-5 pt-20 pb-6">
          <nav
            aria-label="Main navigation"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <ul className="flex flex-col">
              {MOBILE_NAV_HREFS.map((link, i) => (
                <li
                  key={link.href}
                  className={
                    i < MOBILE_NAV_HREFS.length - 1
                      ? "border-b border-white/20"
                      : undefined
                  }
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelayedNavigation(link.href);
                    }}
                    className={mobileMenuLinkClass(activeIndicator === link.href)}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <span
                      className={mobileMenuLabelClass(
                        activeIndicator === link.href,
                      )}
                    >
                      {MOBILE_NAV_LABELS[link.key]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex items-center justify-between gap-4 pt-8 pb-1">
            <p
              className="flex items-center font-swiss text-[0.7rem] tracking-tight text-white/50"
              aria-live="off"
            >
              Philadelphia
              <span
                aria-hidden
                className="mx-2 inline-block size-[3px] rounded-full bg-white/50"
              />
              <span className="tabular-nums">{localTime ?? "—"}</span>
            </p>
            <Link
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                handleDelayedNavigation("/contact");
              }}
              className="menu-drop-link inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 font-swiss text-sm font-medium text-white transition-opacity hover:opacity-90"
              tabIndex={menuOpen ? 0 : -1}
            >
              <span
                className="flex size-5 items-center justify-center rounded-full bg-white/20 text-[0.65rem] leading-none"
                aria-hidden="true"
              >
                ✉
              </span>
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Persistent chrome — only interactive children capture clicks */}
      <header className="pointer-events-none fixed top-0 right-0 left-0 z-[1004] mix-blend-difference text-white">
        <div
          className={`relative z-20 flex w-full items-center justify-between ${CHROME_PAD_X} ${CHROME_PAD_Y}`}
        >
          <div
            ref={headerRowRef}
            className={`relative flex h-16 w-full justify-between ${
              useCompactNav ? "items-center" : "items-start"
            }`}
          >
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleDelayedNavigation("/");
              }}
              className={`swiss-no-select pointer-events-auto relative z-10 flex w-auto min-h-0 shrink-0 items-start overflow-hidden ${LOGO_HEIGHT_CLASS}`}
              aria-label="CDF home"
            >
              {/* White mark on black mobile menu; blend mark otherwise */}
              {menuOpen ? (
                <>
                  <span className={`h-full ${useCompactNav ? "block" : "hidden"}`}>
                    <Logo className={LOGO_IMG_CLASS} forceWhite />
                  </span>
                  <span className={`h-full ${useCompactNav ? "hidden" : "block"}`}>
                    <Logo className={LOGO_IMG_CLASS} blend />
                  </span>
                </>
              ) : (
                <Logo className={LOGO_IMG_CLASS} blend />
              )}
            </Link>

            {/* Desktop open: Store — same row + type size as Contact / Close */}
            {menuOpen && (storeTyped || storeTyping) ? (
              <div
                className={`pointer-events-none absolute inset-y-0 left-1/2 z-10 -translate-x-1/2 items-start ${
                  useCompactNav ? "hidden" : "flex"
                }`}
              >
                <Link
                  ref={storeLinkRef}
                  href="/store"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelayedNavigation("/store");
                  }}
                  className={`${storeMenuLinkClass(activeIndicator === "/store")} pointer-events-auto`}
                  tabIndex={0}
                  aria-label={t.nav.store}
                >
                  <TypewriterSlot
                    full={t.nav.store}
                    typed={storeTyped}
                    typing={storeTyping}
                  />
                </Link>
              </div>
            ) : null}

            {/* Desktop: Contact …… Menu — original 40% band; links sit next to Menu, bottom-aligned */}
            <nav
              className={`pointer-events-auto w-[40%] shrink-0 items-end justify-between font-medium ${
                useCompactNav ? "hidden" : "flex"
              }`}
            >
              <Link
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelayedNavigation("/contact");
                }}
                className={studioLinkClassFor(activeIndicator === "/contact")}
              >
                Contact
              </Link>

              <div className="flex min-w-0 items-end gap-5 lg:gap-7">
                {menuOpen ? (
                  <nav
                    ref={desktopNavRef}
                    id="site-nav-menu"
                    aria-label="Main navigation"
                    className="relative top-[-8px] min-w-0 overflow-hidden"
                  >
                    <div
                      className="relative"
                      style={{
                        clipPath: `inset(0 0 0 ${(1 - linksReveal) * 100}%)`,
                      }}
                    >
                      <ul className="flex flex-nowrap items-end justify-end gap-x-4 lg:gap-x-6">
                        {NAV_HREFS.map((link) => (
                          <li key={link.href} className="shrink-0">
                            <Link
                              href={link.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelayedNavigation(link.href);
                              }}
                              className={menuLinkClass(
                                activeIndicator === link.href,
                              )}
                            >
                              {t.nav[link.key]}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {linksTyping ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute bottom-0 h-[0.85em] w-[0.08em] bg-current animate-[caret-blink_1.1s_linear_infinite]"
                        style={{ left: `${(1 - linksReveal) * 100}%` }}
                      />
                    ) : null}
                  </nav>
                ) : null}

                <button
                  type="button"
                  onClick={toggleMenu}
                  className={`${studioLinkClass} shrink-0 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 font-[inherit] font-medium leading-none`}
                  aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                  aria-expanded={menuOpen}
                  aria-controls="site-nav-menu"
                >
                  <span className="relative inline-block whitespace-nowrap leading-none">
                    <span className="invisible" aria-hidden>
                      {MENU_TOGGLE_CLOSE}
                    </span>
                    <span
                      ref={toggleLabelRef}
                      className="absolute inset-0 flex items-end justify-end whitespace-nowrap leading-none"
                    >
                      {toggleLabel}
                    </span>
                  </span>
                </button>
              </div>
            </nav>

            {/* Mobile: hamburger / close only */}
            <button
              type="button"
              onClick={toggleMenu}
              className={`pointer-events-auto relative z-10 text-current transition-opacity hover:opacity-70 ${
                useCompactNav ? "" : "hidden"
              }`}
              aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls="site-nav-menu-mobile"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

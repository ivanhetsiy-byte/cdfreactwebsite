"use client";

import gsap from "gsap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { NavProgressiveBlur } from "@/components/layout/NavProgressiveBlur";
import { useLanguage, type Language } from "@/context/LanguageContext";
import { useCompactNavMeasure } from "@/hooks/useCompactNav";
import { getLenis } from "@/lib/lenis";
import { shouldSkipSmoothScroll } from "@/lib/motion-env";
import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";
import {
  OPEN_SITE_MENU_EVENT,
  broadcastSiteMenuState,
} from "@/lib/site-menu";

const MOBILE_MENU_LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "uk", label: "UK" },
  { code: "ru", label: "RU" },
  { code: "ja", label: "JA" },
];

/** Desktop inline menu — Contact lives only in persistent chrome. */
const NAV_HREFS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
];

/** Mobile LML-style stack — Contact in list (Figma inverted-active menu). */
const MOBILE_NAV_HREFS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
  { key: "contact" as const, href: "/contact" },
];

/** Title-case labels for mobile menu (desktop keeps uppercase via CSS). */
const MOBILE_NAV_LABELS: Record<
  (typeof MOBILE_NAV_HREFS)[number]["key"],
  string
> = {
  home: "Home",
  about: "About Us",
  classes: "Classes",
  staff: "Staff",
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

/** Figma bookmark tab — hangs from viewport top over the active open-menu link. */
const BOOKMARK_HEIGHT = 73;
const BOOKMARK_PAD_X = 9;
/** Wipe-up + fade when desktop menu closes with bookmark visible. */
const BOOKMARK_EXIT_S = 0.35;
/** Kinfolk-style mobile curtain — bg slides from top, content fades in. */
const MOBILE_MENU_BG_IN_S = 0.8;
const MOBILE_MENU_BG_OUT_S = 0.6;
const MOBILE_MENU_CONTENT_S = 0.55;
/** Sliding inverted bar between menu items. */
const MOBILE_INDICATOR_S = 0.5;
/** Min time menu stays open after tap while page loads underneath. */
const MOBILE_NAV_BREATHE_MS = 650;

/** Desktop open-menu links — small uppercase; active = hanging bookmark (overlay). */
function menuLinkClass(active: boolean) {
  return [
    "menu-inline-link relative shrink-0 font-swiss text-sm font-medium uppercase leading-none tracking-widest md:text-base",
    active
      ? "text-transparent"
      : "text-white transition-opacity hover:opacity-70",
  ].join(" ");
}

type BookmarkLayout = {
  centerX: number;
  label: string;
};

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

/** Mobile open menu — white panel; inverted active via sliding black bar + blend. */
function mobileMenuLinkClass() {
  return [
    "menu-drop-link relative z-10 block w-full px-5 py-[0.35em] text-left font-swiss",
    "text-[clamp(3rem,14vw,4.875rem)] font-normal leading-none tracking-tight",
    "text-white mix-blend-difference transition-opacity hover:opacity-70",
  ].join(" ");
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

function readScrollY() {
  if (typeof window === "undefined") return 0;
  const lenis = (window as unknown as { lenis?: { scroll?: number } }).lenis;
  if (typeof lenis?.scroll === "number") return lenis.scroll;
  return window.scrollY || document.documentElement.scrollTop || 0;
}

type Rgba = { r: number; g: number; b: number; a: number };

function parseCssColor(input: string): Rgba | null {
  const comma = input.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (comma) {
    return {
      r: Number(comma[1]),
      g: Number(comma[2]),
      b: Number(comma[3]),
      a: comma[4] === undefined ? 1 : Number(comma[4]),
    };
  }
  const space = input.match(
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
  );
  if (space) {
    const aRaw = space[4];
    let a = 1;
    if (aRaw !== undefined) {
      a = aRaw.endsWith("%") ? Number(aRaw.slice(0, -1)) / 100 : Number(aRaw);
    }
    return {
      r: Number(space[1]),
      g: Number(space[2]),
      b: Number(space[3]),
      a,
    };
  }
  return null;
}

/** Opaque near-black page surfaces (not mid-grey). */
function isNearBlack(c: Rgba) {
  return c.a >= 0.95 && c.r <= 28 && c.g <= 28 && c.b <= 28;
}

function shouldSkipSurfaceSample(el: Element) {
  if (!(el instanceof HTMLElement)) return true;
  return Boolean(
    el.closest(
      "[data-nav-bookmark-overlay], header, #site-nav-menu-mobile, [data-nav-progressive-blur]",
    ),
  );
}

function parseInsetLength(
  raw: string,
  axisSize: number,
): number | null {
  const v = raw.trim();
  if (v.endsWith("%")) {
    const n = Number(v.slice(0, -1));
    return Number.isFinite(n) ? (n / 100) * axisSize : null;
  }
  if (v.endsWith("px")) {
    const n = Number(v.slice(0, -2));
    return Number.isFinite(n) ? n : null;
  }
  if (v === "0") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Whether (x,y) falls in the element's visible box after CSS `clip-path: inset(...)`.
 * Curtains/wipes that are fully clipped must not count as the page surface.
 */
function elementVisiblyCoversPoint(
  el: HTMLElement,
  x: number,
  y: number,
): boolean {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;

  const clip = getComputedStyle(el).clipPath;
  if (!clip || clip === "none") return true;

  const insetMatch = clip.match(/^inset\(\s*([^)]+?)\s*\)$/i);
  if (!insetMatch?.[1]) {
    // Non-inset clips (path/circle) — only trust if not pointer-events-none
    return getComputedStyle(el).pointerEvents !== "none";
  }

  const bits = insetMatch[1].trim().split(/\s+/);
  let topRaw: string;
  let rightRaw: string;
  let bottomRaw: string;
  let leftRaw: string;
  if (bits.length === 1) {
    topRaw = rightRaw = bottomRaw = leftRaw = bits[0]!;
  } else if (bits.length === 2) {
    topRaw = bottomRaw = bits[0]!;
    rightRaw = leftRaw = bits[1]!;
  } else if (bits.length === 3) {
    topRaw = bits[0]!;
    rightRaw = leftRaw = bits[1]!;
    bottomRaw = bits[2]!;
  } else {
    topRaw = bits[0]!;
    rightRaw = bits[1]!;
    bottomRaw = bits[2]!;
    leftRaw = bits[3]!;
  }

  const top = parseInsetLength(topRaw, r.height);
  const right = parseInsetLength(rightRaw, r.width);
  const bottom = parseInsetLength(bottomRaw, r.height);
  const left = parseInsetLength(leftRaw, r.width);
  if (top == null || right == null || bottom == null || left == null) {
    return getComputedStyle(el).pointerEvents !== "none";
  }

  const visible = {
    top: r.top + top,
    right: r.right - right,
    bottom: r.bottom - bottom,
    left: r.left + left,
  };
  if (visible.right - visible.left < 1 || visible.bottom - visible.top < 1) {
    return false;
  }
  return (
    x >= visible.left &&
    x <= visible.right &&
    y >= visible.top &&
    y <= visible.bottom
  );
}

/**
 * True when the page surface under (x,y) is near-black.
 * 1) Explicit `[data-nav-page-surface=dark]` layers (pointer-events-none curtains
 *    are invisible to elementsFromPoint — must be queried directly).
 * 2) Else first opaque hit from elementsFromPoint (skips nav chrome).
 */
function pageSurfaceIsBlackAt(x: number, y: number) {
  if (typeof document === "undefined") return false;

  const marked = document.querySelectorAll("[data-nav-page-surface='dark']");
  for (const el of marked) {
    if (!(el instanceof HTMLElement)) continue;
    if (!elementVisiblyCoversPoint(el, x, y)) continue;
    const parsed = parseCssColor(getComputedStyle(el).backgroundColor);
    if (parsed && parsed.a >= 0.95) return isNearBlack(parsed);
    // Marked dark with no parsable bg — still treat as dark if it covers
    return true;
  }

  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (shouldSkipSurfaceSample(el)) continue;
    if (!(el instanceof HTMLElement)) continue;
    if (!elementVisiblyCoversPoint(el, x, y)) continue;
    const parsed = parseCssColor(getComputedStyle(el).backgroundColor);
    if (!parsed || parsed.a < 0.95) continue;
    return isNearBlack(parsed);
  }

  for (const el of [document.body, document.documentElement]) {
    if (!el) continue;
    const parsed = parseCssColor(getComputedStyle(el).backgroundColor);
    if (!parsed || parsed.a < 0.95) continue;
    return isNearBlack(parsed);
  }

  return false;
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
  const { t, language, setLanguage } = useLanguage();
  const navLockRef = useRef(false);
  const closingRef = useRef(false);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileBgRef = useRef<HTMLDivElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  const mobileNavListRef = useRef<HTMLUListElement>(null);
  const mobileIndicatorRef = useRef<HTMLDivElement>(null);
  const mobileIndicatorTweenRef = useRef<gsap.core.Tween | null>(null);
  const mobileNavRevealGateRef = useRef<{
    path: string;
    slideP: Promise<void>;
    startedAt: number;
  } | null>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const storeLinkRef = useRef<HTMLAnchorElement>(null);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const probeBandRef = useRef<HTMLDivElement>(null);
  const contactProbeRef = useRef<HTMLSpanElement>(null);
  const linksProbeRef = useRef<HTMLDivElement>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const requestCloseRef = useRef<() => void>(() => {});
  const [activeIndicator, setActiveIndicator] = useState(pathname);
  const activeIndicatorRef = useRef(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const blurRootRef = useRef<HTMLDivElement>(null);
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
  const bookmarkRef = useRef<HTMLDivElement>(null);
  const bookmarkExitTweenRef = useRef<gsap.core.Tween | null>(null);
  /** Compact menu: route loading under curtain; wipe up when pathname matches. */
  const mobileNavPendingRef = useRef<string | null>(null);
  const [bookmarkLayout, setBookmarkLayout] = useState<BookmarkLayout | null>(
    null,
  );
  const [bookmarkLeaving, setBookmarkLeaving] = useState(false);
  /** Invert bookmark when page surface under it is solid black (frozen while leaving). */
  const [bookmarkOnBlackBg, setBookmarkOnBlackBg] = useState(false);
  const bookmarkLeavingRef = useRef(false);

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
    activeIndicatorRef.current = pathname;
  }, [pathname]);

  // Position the true-black bookmark outside mix-blend-difference chrome.
  useLayoutEffect(() => {
    if (bookmarkLeaving) return;

    if (!menuOpen || useCompactNav) {
      setBookmarkLayout((prev) => (prev === null ? prev : null));
      return;
    }

    const active = NAV_HREFS.find((link) => link.href === activeIndicator);
    if (!active) {
      setBookmarkLayout((prev) => (prev === null ? prev : null));
      return;
    }

    const label = t.nav[active.key];

    const measure = () => {
      if (bookmarkLeavingRef.current) return;
      const nav = desktopNavRef.current;
      if (!nav) {
        setBookmarkLayout((prev) => (prev === null ? prev : null));
        return;
      }
      const el = nav.querySelector<HTMLElement>(
        `[data-nav-bookmark="${active.href}"]`,
      );
      if (!el) {
        setBookmarkLayout((prev) => (prev === null ? prev : null));
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width < 1) {
        setBookmarkLayout((prev) => (prev === null ? prev : null));
        return;
      }
      const centerX = r.left + r.width / 2;
      setBookmarkLayout((prev) => {
        if (
          prev &&
          Math.abs(prev.centerX - centerX) < 0.5 &&
          prev.label === label
        ) {
          return prev;
        }
        return { centerX, label };
      });
    };

    measure();
    const nav = desktopNavRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" && nav
        ? new ResizeObserver(measure)
        : null;
    if (nav && ro) ro.observe(nav);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [
    menuOpen,
    useCompactNav,
    activeIndicator,
    t.nav,
    bookmarkLeaving,
  ]);

  useEffect(() => {
    bookmarkLeavingRef.current = bookmarkLeaving;
  }, [bookmarkLeaving]);

  // Invert bookmark only over solid black page surfaces (not black glyphs).
  useEffect(() => {
    const centerX = bookmarkLayout?.centerX;
    const linksVisible = linksReveal > 0;
    const visible =
      centerX != null &&
      (bookmarkLeaving || (menuOpen && !useCompactNav && linksVisible));
    if (!visible || centerX == null) return;

    const sample = () => {
      if (bookmarkLeavingRef.current) return;
      const next = pageSurfaceIsBlackAt(centerX, BOOKMARK_HEIGHT / 2);
      setBookmarkOnBlackBg((prev) => (prev === next ? prev : next));
    };

    sample();

    let unsub: (() => void) | undefined;
    let raf = 0;
    let tries = 0;
    let usedNativeFallback = false;

    const attach = () => {
      const lenis = getLenis();
      if (lenis) {
        unsub = lenis.on("scroll", sample);
        return;
      }
      if (tries++ < 60) {
        raf = requestAnimationFrame(attach);
        return;
      }
      usedNativeFallback = true;
      window.addEventListener("scroll", sample, { passive: true });
    };
    attach();
    window.addEventListener("resize", sample);

    return () => {
      cancelAnimationFrame(raf);
      unsub?.();
      if (usedNativeFallback) {
        window.removeEventListener("scroll", sample);
      }
      window.removeEventListener("resize", sample);
    };
  }, [
    bookmarkLayout?.centerX,
    bookmarkLeaving,
    menuOpen,
    useCompactNav,
    linksReveal > 0,
    pathname,
  ]);

  useEffect(() => {
    return () => {
      bookmarkExitTweenRef.current?.kill();
    };
  }, []);

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

  // Gradual frost — CSS var on blur root (avoids navbar re-renders on scroll).
  // Prefer Lenis when present; otherwise native scroll. Coalesce to one write/frame.
  useEffect(() => {
    let writeRaf = 0;
    let attachRaf = 0;
    let unsub: (() => void) | undefined;
    let usedNative = false;
    let tries = 0;

    const write = () => {
      writeRaf = 0;
      const y = readScrollY();
      const p = Math.min(1, Math.max(0, y / BLUR_SCROLL_RANGE));
      blurRootRef.current?.style.setProperty(
        "--nav-blur-progress",
        p.toFixed(4),
      );
    };

    const scheduleWrite = () => {
      if (writeRaf) return;
      writeRaf = requestAnimationFrame(write);
    };

    write();

    const attachNative = () => {
      usedNative = true;
      window.addEventListener("scroll", scheduleWrite, { passive: true });
    };

    const attach = () => {
      const lenis = getLenis();
      if (lenis) {
        unsub = lenis.on("scroll", scheduleWrite);
        return;
      }
      // Mobile / PRM skip Lenis entirely — don't wait ~1s before attaching.
      if (shouldSkipSmoothScroll() || tries++ >= 12) {
        attachNative();
        return;
      }
      attachRaf = requestAnimationFrame(attach);
    };
    attach();

    return () => {
      cancelAnimationFrame(writeRaf);
      cancelAnimationFrame(attachRaf);
      unsub?.();
      if (usedNative) {
        window.removeEventListener("scroll", scheduleWrite);
      }
    };
  }, [pathname]);

  const parkMobileMenu = useCallback(() => {
    const panel = mobilePanelRef.current;
    const bg = mobileBgRef.current;
    const content = mobileContentRef.current;
    if (!panel || !bg) return;
    gsap.set(panel, { clipPath: "inset(0 0 100% 0)" });
    gsap.set(bg, { yPercent: -100 });
    if (content) gsap.set(content, { opacity: 0, y: -20 });
    // Clear per-link transforms so a later open isn't stuck at opacity 0
    const links = panel.querySelectorAll<HTMLElement>(".menu-drop-link");
    if (links.length) gsap.set(links, { clearProps: "opacity,transform" });
    mobileIndicatorTweenRef.current?.kill();
    // Hide active bar while parked — otherwise it pops in late on next open
    const indicator = mobileIndicatorRef.current;
    if (indicator) gsap.set(indicator, { opacity: 0 });
  }, []);

  const snapMobileIndicatorTo = useCallback((href: string, opts?: { fade?: boolean; fadeDuration?: number }) => {
    const list = mobileNavListRef.current;
    const indicator = mobileIndicatorRef.current;
    if (!list || !indicator) return;
    const link = list.querySelector<HTMLElement>(
      `[data-mobile-nav="${href}"]`,
    );
    if (!link) return;
    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const top = linkRect.top - listRect.top + list.scrollTop;
    mobileIndicatorTweenRef.current?.kill();
    if (opts?.fade && !prefersReducedMotion()) {
      gsap.set(indicator, { top, height: linkRect.height, opacity: 0 });
      mobileIndicatorTweenRef.current = gsap.to(indicator, {
        opacity: 1,
        duration: opts.fadeDuration ?? 0.22,
        ease: "power2.out",
        onComplete: () => {
          mobileIndicatorTweenRef.current = null;
        },
      });
      return;
    }
    gsap.set(indicator, {
      top,
      height: linkRect.height,
      opacity: 1,
    });
  }, []);

  const slideMobileIndicatorTo = useCallback(
    (href: string) =>
      new Promise<void>((resolve) => {
        const list = mobileNavListRef.current;
        const indicator = mobileIndicatorRef.current;
        if (!list || !indicator) {
          resolve();
          return;
        }
        const link = list.querySelector<HTMLElement>(
          `[data-mobile-nav="${href}"]`,
        );
        if (!link) {
          resolve();
          return;
        }
        const listRect = list.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const top = linkRect.top - listRect.top + list.scrollTop;

        mobileIndicatorTweenRef.current?.kill();

        if (prefersReducedMotion()) {
          gsap.set(indicator, { top, height: linkRect.height, opacity: 1 });
          resolve();
          return;
        }

        mobileIndicatorTweenRef.current = gsap.to(indicator, {
          top,
          height: linkRect.height,
          opacity: 1,
          duration: MOBILE_INDICATOR_S,
          ease: "power3.inOut",
          onComplete: () => {
            mobileIndicatorTweenRef.current = null;
            resolve();
          },
        });
      }),
    [],
  );

  // Keep mobile panel clipped shut when closed (Kinfolk curtain park)
  useEffect(() => {
    parkMobileMenu();
  }, [parkMobileMenu]);

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
      parkMobileMenu();

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
    const bg = mobileBgRef.current;
    const content = mobileContentRef.current;
    if (!panel || !bg) return;

    if (reduced) {
      gsap.set(panel, { clipPath: "inset(0 0 0 0)" });
      gsap.set(bg, { yPercent: 0 });
      if (content) gsap.set(content, { opacity: 1, y: 0 });
      snapMobileIndicatorTo(activeIndicatorRef.current);
      return;
    }

    // Kinfolk: clip opens, curtain slides down from top, content fades in.
    // No translateY on content during open — a transform breaks mix-blend with the
    // black active bar, which previously forced a late opacity pop at curtain end.
    gsap.set(panel, { clipPath: "inset(0 0 100% 0)" });
    gsap.set(bg, { yPercent: -100 });
    if (content) gsap.set(content, { opacity: 0, y: 0, clearProps: "transform" });
    const links = panel.querySelectorAll<HTMLElement>(".menu-drop-link");
    if (links.length) gsap.set(links, { clearProps: "opacity,transform" });
    {
      const ind = mobileIndicatorRef.current;
      if (ind) gsap.set(ind, { opacity: 0 });
      const list = mobileNavListRef.current;
      const href = activeIndicatorRef.current;
      const link = list?.querySelector<HTMLElement>(`[data-mobile-nav="${href}"]`);
      if (list && ind && link) {
        const listRect = list.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        gsap.set(ind, {
          top: linkRect.top - listRect.top + list.scrollTop,
          height: linkRect.height,
          opacity: 0,
        });
      }
    }

    const tl = gsap.timeline();
    openTlRef.current = tl;
    tl.set(panel, { clipPath: "inset(0 0 0 0)" });
    tl.to(bg, {
      yPercent: 0,
      duration: MOBILE_MENU_BG_IN_S,
      ease: "power3.out",
    });
    if (content) {
      tl.to(
        content,
        {
          opacity: 1,
          duration: MOBILE_MENU_CONTENT_S,
          ease: "power3.out",
        },
        "<",
      );
    }
    // Fade active bar in with content (same start), not after bg curtain
    tl.add(() => {
      snapMobileIndicatorTo(activeIndicatorRef.current, {
        fade: true,
        fadeDuration: MOBILE_MENU_CONTENT_S,
      });
    }, 0);

    return () => {
      tl.kill();
      if (openTlRef.current === tl) openTlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open choreography
  }, [menuOpen, useCompactNav, snapMobileIndicatorTo]);

  // Lock page scroll only for full-screen compact menu
  useEffect(() => {
    if (!menuOpen || !useCompactNav) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen, useCompactNav]);

  const animateMobileMenuOut = useCallback(
    (onComplete: () => void) => {
      const panel = mobilePanelRef.current;
      const bg = mobileBgRef.current;
      const content = mobileContentRef.current;

      if (!panel || !bg) {
        onComplete();
        return;
      }

      if (prefersReducedMotion()) {
        parkMobileMenu();
        onComplete();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          parkMobileMenu();
          onComplete();
        },
      });
      openTlRef.current = tl;

      if (content) {
        tl.to(content, {
          opacity: 0,
          y: -20,
          duration: MOBILE_MENU_CONTENT_S,
          ease: "power3.out",
        });
      }
      tl.to(
        bg,
        {
          yPercent: -100,
          duration: MOBILE_MENU_BG_OUT_S,
          ease: "power3.out",
        },
        content ? "-=0.2" : 0,
      );
      tl.to(
        panel,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: MOBILE_MENU_BG_OUT_S,
          ease: "power3.out",
        },
        "<",
      );
    },
    [parkMobileMenu],
  );

  /** Desktop open menu — Store typewriter-erase + bookmark wipe-up; links snap off. */
  const animateDesktopMenuOut = (onComplete?: () => void) => {
    const snapClosed = () => {
      bumpTypewriterGen();
      bookmarkExitTweenRef.current?.kill();
      bookmarkExitTweenRef.current = null;
      setBookmarkLeaving(false);
      setBookmarkLayout(null);
      setMenuOpen(false);
      linksRevealRef.current = 0;
      setLinksReveal(0);
      setLinksTyping(false);
      setStoreTyped("");
      setStoreTyping(false);
      storeTypedRef.current = "";
      closingRef.current = false;
    };

    if (prefersReducedMotion()) {
      snapClosed();
      onComplete?.();
      return;
    }

    closingRef.current = true;
    openTlRef.current?.kill();
    linksTweenRef.current?.kill();
    setLinksTyping(false);

    const gen = bumpTypewriterGen();

    const bookmarkOut = new Promise<void>((resolve) => {
      const el = bookmarkRef.current;
      if (!el || !bookmarkLayout) {
        resolve();
        return;
      }
      setBookmarkLeaving(true);
      bookmarkExitTweenRef.current?.kill();
      gsap.set(el, { yPercent: 0, opacity: linksRevealRef.current || 1 });
      bookmarkExitTweenRef.current = gsap.to(el, {
        yPercent: -100,
        opacity: 0,
        duration: BOOKMARK_EXIT_S,
        ease: "power2.in",
        onComplete: () => {
          bookmarkExitTweenRef.current = null;
          resolve();
        },
      });
    });

    void (async () => {
      setStoreTyping(true);
      const [storeOk] = await Promise.all([
        deleteChars(
          storeTypedRef.current || t.nav.store,
          (next) => {
            storeTypedRef.current = next;
            setStoreTyped(next);
          },
          gen,
          28,
        ),
        bookmarkOut,
      ]);
      if (!storeOk || typewriterGenRef.current !== gen) return;

      storeTypedRef.current = "";
      setStoreTyped("");
      setStoreTyping(false);
      setBookmarkLeaving(false);
      setBookmarkLayout(null);
      // Links snap off with menu close — no wipe
      setMenuOpen(false);
      linksRevealRef.current = 0;
      setLinksReveal(0);
      closingRef.current = false;
      onComplete?.();
    })();
  };

  const requestClose = () => {
    if (closingRef.current) return;
    if (!menuOpen) return;

    // Cancel in-flight soft nav under the curtain
    if (mobileNavPendingRef.current) {
      mobileNavPendingRef.current = null;
      mobileNavRevealGateRef.current = null;
      navLockRef.current = false;
    }

    if (prefersReducedMotion()) {
      bumpTypewriterGen();
      bookmarkExitTweenRef.current?.kill();
      bookmarkExitTweenRef.current = null;
      setBookmarkLeaving(false);
      setBookmarkLayout(null);
      setMenuOpen(false);
      linksRevealRef.current = 0;
      setLinksReveal(0);
      setLinksTyping(false);
      setStoreTyped("");
      setStoreTyping(false);
      storeTypedRef.current = "";
      parkMobileMenu();
      closingRef.current = false;
      return;
    }

    if (!compactRef.current) {
      animateDesktopMenuOut();
      return;
    }

    closingRef.current = true;
    openTlRef.current?.kill();
    animateMobileMenuOut(() => {
      setMenuOpen(false);
      closingRef.current = false;
    });
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

  // Compact menu soft-nav: load under curtain, slide indicator, breathe, then wipe up
  useEffect(() => {
    const gate = mobileNavRevealGateRef.current;
    if (!gate || pathname !== gate.path) return;

    let cancelled = false;
    void (async () => {
      await gate.slideP;
      if (cancelled) return;
      const elapsed = Date.now() - gate.startedAt;
      const wait = Math.max(
        0,
        prefersReducedMotion() ? 0 : MOBILE_NAV_BREATHE_MS - elapsed,
      );
      if (wait > 0) await delay(wait);
      if (cancelled) return;
      if (mobileNavPendingRef.current !== gate.path) return;

      mobileNavPendingRef.current = null;
      mobileNavRevealGateRef.current = null;
      closingRef.current = true;
      openTlRef.current?.kill();
      animateMobileMenuOut(() => {
        setMenuOpen(false);
        closingRef.current = false;
        navLockRef.current = false;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, animateMobileMenuOut]);

  const commitDelayedNavigation = (targetPath: string) => {
    closingRef.current = false;
    bumpTypewriterGen();
    openTlRef.current?.kill();
    bookmarkExitTweenRef.current?.kill();
    bookmarkExitTweenRef.current = null;
    setBookmarkLeaving(false);
    setBookmarkLayout(null);
    setMenuOpen(false);
    linksRevealRef.current = 0;
    setLinksReveal(0);
    setLinksTyping(false);
    setStoreTyped("");
    setStoreTyping(false);
    storeTypedRef.current = "";
    parkMobileMenu();

    setActiveIndicator(targetPath);

    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, ROUTE_COVER_MS);
  };

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) {
      requestClose();
      return;
    }
    if (navLockRef.current) return;

    navLockRef.current = true;

    // Desktop menu open: close with typewriter, then page transition
    if (menuOpen && !compactRef.current) {
      animateDesktopMenuOut(() => commitDelayedNavigation(targetPath));
      return;
    }

    // Compact menu: load under curtain, slide black bar, breathe, then wipe up
    if (menuOpen && compactRef.current) {
      mobileNavPendingRef.current = targetPath;
      activeIndicatorRef.current = targetPath;
      setActiveIndicator(targetPath);
      const slideP = slideMobileIndicatorTo(targetPath);
      mobileNavRevealGateRef.current = {
        path: targetPath,
        slideP,
        startedAt: Date.now(),
      };
      router.push(targetPath);
      return;
    }

    commitDelayedNavigation(targetPath);
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
  const showBookmark =
    bookmarkLayout !== null &&
    (bookmarkLeaving ||
      (menuOpen && !useCompactNav && linksReveal > 0));

  return (
    <>
      {/* Active open-menu bookmark — invert only over solid black page surfaces */}
      {showBookmark && bookmarkLayout ? (
        <div
          aria-hidden
          data-nav-bookmark-overlay
          className="pointer-events-none fixed top-0 z-[1005] -translate-x-1/2"
          style={{ left: bookmarkLayout.centerX }}
        >
          <div
            ref={bookmarkRef}
            className={[
              "flex items-end justify-center overflow-hidden font-swiss text-sm font-medium uppercase leading-none tracking-widest md:text-base",
              bookmarkOnBlackBg
                ? "bg-white text-black"
                : "bg-black text-white",
            ].join(" ")}
            style={{
              height: BOOKMARK_HEIGHT,
              paddingLeft: BOOKMARK_PAD_X,
              paddingRight: BOOKMARK_PAD_X,
              paddingBottom: 9,
              opacity: bookmarkLeaving ? undefined : linksReveal,
            }}
          >
            {bookmarkLayout.label}
          </div>
        </div>
      ) : null}

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

      {/* Mobile only — Kinfolk curtain wipe over white inverted-active menu */}
      <div
        ref={mobilePanelRef}
        id="site-nav-menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menu}
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[1003] overflow-hidden text-black ${
          useCompactNav ? "" : "hidden"
        } ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          ref={mobileBgRef}
          aria-hidden
          className="absolute inset-0 bg-white will-change-transform"
        />
        <div
          ref={mobileContentRef}
          className="relative z-10 flex h-full flex-col bg-white pt-20 pb-6"
        >
          <nav
            aria-label="Main navigation"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <ul ref={mobileNavListRef} className="relative flex flex-col">
              <div
                ref={mobileIndicatorRef}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-0 bg-black opacity-0 will-change-transform"
              />
              {MOBILE_NAV_HREFS.map((link) => {
                const isActive = activeIndicator === link.href;
                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      data-mobile-nav={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelayedNavigation(link.href);
                      }}
                      className={mobileMenuLinkClass()}
                      aria-current={isActive ? "page" : undefined}
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      {MOBILE_NAV_LABELS[link.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Status chrome moved from bottom bar on mobile */}
          <div className="mt-auto flex flex-col gap-5 px-5 pt-8">
            <p className="font-swiss text-[0.75rem] tracking-tight text-black/45">
              © CDF, LLC
              <span className="ml-2 text-black/30">Est. for the stage</span>
            </p>
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Language"
            >
              {MOBILE_MENU_LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={() => setLanguage(code)}
                  className={[
                    "cursor-pointer px-1.5 py-1 font-swiss text-[0.75rem] tracking-wide transition-opacity",
                    language === code
                      ? "text-black underline underline-offset-4"
                      : "text-black/35 hover:text-black/70",
                  ].join(" ")}
                  aria-pressed={language === code}
                  aria-label={`Language: ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>
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
              data-nav-home-logo
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
                        {NAV_HREFS.map((link) => {
                          const isActive = activeIndicator === link.href;
                          return (
                            <li key={link.href} className="shrink-0">
                              <Link
                                href={link.href}
                                data-nav-bookmark={link.href}
                                aria-current={isActive ? "page" : undefined}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelayedNavigation(link.href);
                                }}
                                className={menuLinkClass(isActive)}
                              >
                                {t.nav[link.key]}
                              </Link>
                            </li>
                          );
                        })}
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

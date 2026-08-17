import type { Language } from "@/context/LanguageContext";

export const MOBILE_MENU_LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "uk", label: "UK" },
  { code: "ru", label: "RU" },
  { code: "ja", label: "JA" },
];

/** Desktop inline menu — Contact lives only in persistent chrome. */
export const NAV_HREFS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
];

/** Mobile LML-style stack — Contact in list (Figma inverted-active menu). */
export const MOBILE_NAV_HREFS = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "classes" as const, href: "/classes" },
  { key: "staff" as const, href: "/staff" },
  { key: "contact" as const, href: "/contact" },
];

/** Title-case labels for mobile menu (desktop keeps uppercase via CSS). */
export const MOBILE_NAV_LABELS: Record<
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
export const LOGO_HEIGHT_CLASS =
  "h-[calc(min(25vw,220px)*179/467)] home-md:h-[calc(min(15vw,180px)*179/467)]";

/** Stretch mark so cropped frame’s bottom = last ink pixel. */
export const LOGO_IMG_CLASS =
  "!h-[calc(100%*77/55)] !w-auto !max-h-none !items-start";

/** Chrome pad — top→logo gap. */
export const CHROME_PAD_X = "px-5 home-md:px-6.5";
export const CHROME_PAD_Y = "py-4 home-md:py-6.5";

/** Scroll distance (px) over which nav frost fades in. */
export const BLUR_SCROLL_RANGE = 120;

/** Figma bookmark tab — hangs from viewport top over the active open-menu link. */
export const BOOKMARK_HEIGHT = 73;
export const BOOKMARK_PAD_X = 9;
/** Wipe-up + fade when desktop menu closes with bookmark visible. */
export const BOOKMARK_EXIT_S = 0.35;
/** Kinfolk-style mobile curtain — bg slides from top, content fades in. */
export const MOBILE_MENU_BG_IN_S = 0.8;
export const MOBILE_MENU_BG_OUT_S = 0.6;
export const MOBILE_MENU_CONTENT_S = 0.55;
/** Sliding inverted bar between menu items. */
export const MOBILE_INDICATOR_S = 0.5;
/** Min time menu stays open after tap while page loads underneath. */
export const MOBILE_NAV_BREATHE_MS = 650;

/** Chrome Menu ↔ Close labels (title case, matches Contact). */
export const MENU_TOGGLE_OPEN = "Menu";
export const MENU_TOGGLE_CLOSE = "Close";

/** Desktop open-menu links — small uppercase; active = hanging bookmark (overlay). */
export function menuLinkClass(active: boolean) {
  return [
    "menu-inline-link relative shrink-0 font-swiss text-sm font-medium uppercase leading-none tracking-widest home-md:text-base",
    active
      ? "text-transparent"
      : "text-white transition-opacity hover:opacity-70",
  ].join(" ");
}

/** Same as lab StudioHeader Work/Studio — top-aligned with −8px optical nudge. */
export const studioLinkClass =
  "relative top-[-8px] inline-block font-medium text-[3.2rem] leading-none text-white transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:content-[''] hover:after:w-full";

export function studioLinkClassFor(active: boolean) {
  return [
    "relative top-[-8px] inline-block font-medium text-[3.2rem] leading-none text-white transition-colors",
    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-current after:transition-all after:content-['']",
    active ? "after:w-full" : "after:w-0 hover:after:w-full",
  ].join(" ");
}

/** Open-menu Store — same size/optical nudge as Contact / Close. */
export function storeMenuLinkClass(active: boolean) {
  return [
    "menu-store-link relative top-[-8px] inline-block shrink-0 font-medium normal-case leading-none text-white transition-colors",
    "text-[3.2rem]",
    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-current after:transition-[width] after:duration-300 after:ease-out after:content-['']",
    active ? "after:w-full" : "after:w-0 hover:after:w-full",
  ].join(" ");
}

/** Mobile open menu — white panel; inverted active via sliding black bar + blend. */
export function mobileMenuLinkClass() {
  return [
    "menu-drop-link relative z-10 block w-full px-5 py-[0.35em] text-left font-swiss",
    "text-[clamp(3rem,14vw,4.875rem)] font-normal leading-none tracking-tight",
    "text-white mix-blend-difference transition-opacity hover:opacity-70",
  ].join(" ");
}

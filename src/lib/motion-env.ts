/** Shared motion / viewport environment checks for mobile performance gates. */

const NARROW_MQ = "(max-width: 767px)";
const COARSE_MQ = "(pointer: coarse)";
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";
/** Desktop mouse/trackpad layout — Lenis, pin/scrub, frost, mix-blend chrome. */
const DESKTOP_FINE_MQ = "(min-width: 768px) and (pointer: fine)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MQ).matches;
}

/** True on narrow viewports or coarse pointers (phones / most tablets). */
export function isCoarseOrNarrow(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia(NARROW_MQ).matches ||
    window.matchMedia(COARSE_MQ).matches
  );
}

/** Wide + fine pointer only — keep expensive continuous motion here. */
export function isDesktopFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DESKTOP_FINE_MQ).matches;
}

/**
 * Skip Lenis smooth-scroll and other desktop-only continuous motion systems.
 * Native scroll + ScrollTrigger remains fine on these devices.
 *
 * Anything that is not desktopFine (phones, coarse landscape tablets, PRM)
 * uses native scroll so lag-scrub never fights touch.
 */
export function shouldSkipSmoothScroll(): boolean {
  return prefersReducedMotion() || !isDesktopFinePointer();
}

export const MOTION_MQ = {
  narrow: NARROW_MQ,
  coarse: COARSE_MQ,
  reduced: REDUCED_MQ,
  desktopFine: DESKTOP_FINE_MQ,
} as const;

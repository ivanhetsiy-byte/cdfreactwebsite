/** Shared motion / viewport environment checks for mobile performance gates. */

const NARROW_MQ = "(max-width: 767px)";
const COARSE_MQ = "(pointer: coarse)";
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";

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

/**
 * Skip Lenis smooth-scroll and other desktop-only continuous motion systems.
 * Native scroll + ScrollTrigger remains fine on these devices.
 */
export function shouldSkipSmoothScroll(): boolean {
  return prefersReducedMotion() || isCoarseOrNarrow();
}

export const MOTION_MQ = {
  narrow: NARROW_MQ,
  coarse: COARSE_MQ,
  reduced: REDUCED_MQ,
  /** Desktop fine-pointer layout — keep frost / Lenis here. */
  desktopFine: "(min-width: 768px) and (pointer: fine)",
} as const;

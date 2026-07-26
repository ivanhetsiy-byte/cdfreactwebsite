/** Pre-navigation blackout signal for the dual wipe curtain. */

export const ROUTE_COVER_EVENT = "cdf-route-cover";

/**
 * How long callers should wait after `requestRouteCover()` before
 * swapping the route — matches the red→dark wipe-in duration.
 */
export const ROUTE_COVER_MS = 650;

export function requestRouteCover() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_COVER_EVENT));
}

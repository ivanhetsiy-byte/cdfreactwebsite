/** Pre-navigation signal for the white fade cover. */

export const ROUTE_COVER_EVENT = "cdf-route-cover";

/**
 * How long callers should wait after `requestRouteCover()` before
 * swapping the route — matches the white fade-in duration.
 */
export const ROUTE_COVER_MS = 400;

export function requestRouteCover() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_COVER_EVENT));
}

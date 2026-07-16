/** Pre-navigation blackout signal for the route fade curtain. */

export const ROUTE_COVER_EVENT = "cdf-route-cover";

export function requestRouteCover() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_COVER_EVENT));
}

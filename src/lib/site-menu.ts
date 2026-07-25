/** Fired by StudioHeader (staff) so the site Navbar can open its menu overlay. */
export const OPEN_SITE_MENU_EVENT = "cdf-open-site-menu";

/** Fired when the site menu open state changes — status bar listens to hide on mobile. */
export const SITE_MENU_STATE_EVENT = "cdf-site-menu-state";

export function requestOpenSiteMenu() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_SITE_MENU_EVENT));
}

export function broadcastSiteMenuState(open: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SITE_MENU_STATE_EVENT, { detail: { open } }),
  );
  document.body.classList.toggle("site-menu-open", open);
}

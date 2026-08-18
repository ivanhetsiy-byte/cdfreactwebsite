import { ScrollTrigger } from "gsap/ScrollTrigger";

let timer = 0;

/** Coalesce mount-time refresh storms into one layout pass. */
export function scheduleScrollTriggerRefresh() {
  if (typeof window === "undefined") return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = 0;
    ScrollTrigger.refresh();
  }, 80);
}

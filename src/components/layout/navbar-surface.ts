export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function readScrollY() {
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

function parseInsetLength(raw: string, axisSize: number): number | null {
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
export function pageSurfaceIsBlackAt(x: number, y: number) {
  if (typeof document === "undefined") return false;

  const marked = document.querySelectorAll("[data-nav-page-surface='dark']");
  for (const el of marked) {
    if (!(el instanceof HTMLElement)) continue;
    if (!elementVisiblyCoversPoint(el, x, y)) continue;
    const parsed = parseCssColor(getComputedStyle(el).backgroundColor);
    if (parsed && parsed.a >= 0.95) return isNearBlack(parsed);
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

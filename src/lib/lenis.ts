export type LenisApi = {
  animatedScroll: number;
  isLocked: boolean;
  start: () => void;
  stop: () => void;
  resize?: () => void;
  on: (
    event: "scroll",
    callback: (scroll: { animatedScroll: number }) => void,
  ) => () => void;
  off: (
    event: "scroll",
    callback: (scroll: { animatedScroll: number }) => void,
  ) => void;
  scrollTo: (
    target: string | number,
    options?: {
      duration?: number;
      immediate?: boolean;
      lock?: boolean;
      force?: boolean;
      offset?: number;
      easing?: (t: number) => number;
      onComplete?: () => void;
    },
  ) => void;
};

export function getLenis(): LenisApi | null {
  if (typeof window === "undefined") return null;
  const lenis = (window as unknown as { lenis?: LenisApi }).lenis;
  if (!lenis || typeof lenis.start !== "function") return null;
  return lenis;
}

export const quinticEase = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

/** Bell-curve velocity — slow → fast → slow (half-sine). */
export const sineEaseInOut = (t: number) =>
  -(Math.cos(Math.PI * t) - 1) / 2;

/** Exponential build-up then negative-exponential slowdown. */
export const expoEaseInOut = (t: number) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
  return (2 - Math.pow(2, -20 * t + 10)) / 2;
};

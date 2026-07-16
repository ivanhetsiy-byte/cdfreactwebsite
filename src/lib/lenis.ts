export type LenisApi = {
  animatedScroll: number;
  start: () => void;
  stop: () => void;
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

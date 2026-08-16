"use client";

import { useEffect, useRef, useState } from "react";

import { isCoarseOrNarrow, prefersReducedMotion } from "@/lib/motion-env";

/** Full-viewport film-grain overlay (2D canvas), matching LML's noise layer.
 *  Disabled on mobile / reduced-motion — continuous putImageData is too costly. */
export function NoiseOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!prefersReducedMotion() && !isCoarseOrNarrow());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const SIZE = 256;
    canvas.width = SIZE;
    canvas.height = SIZE;

    let raf = 0;
    let last = 0;

    const draw = (t: number) => {
      // Throttle — grain doesn't need 60fps.
      if (t - last > 50) {
        last = t;
        const image = ctx.createImageData(SIZE, SIZE);
        const data = image.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 40;
        }
        ctx.putImageData(image, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={ref}
      className="noise-overlay"
      aria-hidden
    />
  );
}

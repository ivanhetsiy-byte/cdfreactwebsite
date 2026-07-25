"use client";

import { useEffect, useRef } from "react";

/** Full-viewport film-grain overlay (2D canvas), matching LML's noise layer. */
export function NoiseOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <canvas
      ref={ref}
      className="noise-overlay"
      aria-hidden
    />
  );
}

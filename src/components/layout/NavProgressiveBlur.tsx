"use client";

import type { CSSProperties, RefObject } from "react";

/**
 * Progressive frosted edge: stacked backdrop-blur bands masked so blur is
 * strongest at the top and fades downward.
 *
 * Progress is driven via CSS `--nav-blur-progress` (0–1) so scroll updates
 * do not re-render the navbar React tree. Kept to 3 layers — each
 * backdrop-filter pass is GPU-expensive.
 */
const BLUR_LAYERS = [
  {
    blur: 20,
    mask: "linear-gradient(rgb(0,0,0) 0%, rgba(0,0,0,0) 40%)",
  },
  {
    blur: 8,
    mask: "linear-gradient(rgba(0,0,0,0) 0%, rgb(0,0,0) 35%, rgba(0,0,0,0) 70%)",
  },
  {
    blur: 2,
    mask: "linear-gradient(rgba(0,0,0,0) 40%, rgb(0,0,0) 100%)",
  },
] as const;

type NavProgressiveBlurProps = {
  rootRef?: RefObject<HTMLDivElement | null>;
};

export function NavProgressiveBlur({ rootRef }: NavProgressiveBlurProps) {
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-nav-progressive-blur
      className="pointer-events-none fixed top-0 right-0 left-0 z-[999] h-[100px] md:h-[120px]"
      style={{ "--nav-blur-progress": 0 } as CSSProperties}
    >
      <div
        className="relative h-full w-full"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 100%)",
        }}
      >
        {BLUR_LAYERS.map((layer, i) => (
          <div
            key={layer.blur}
            className="absolute inset-0"
            style={{
              zIndex: i + 1,
              backdropFilter: `blur(calc(${layer.blur}px * var(--nav-blur-progress, 0)))`,
              WebkitBackdropFilter: `blur(calc(${layer.blur}px * var(--nav-blur-progress, 0)))`,
              maskImage: layer.mask,
              WebkitMaskImage: layer.mask,
            }}
          />
        ))}
      </div>
    </div>
  );
}

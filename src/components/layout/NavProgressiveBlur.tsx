"use client";

import type { CSSProperties, RefObject } from "react";

/**
 * LML-style progressive frosted edge: stacked backdrop-blur bands
 * masked so blur is strongest at the top and fades downward.
 *
 * Progress is driven via CSS `--nav-blur-progress` (0–1) so scroll
 * updates do not re-render the navbar React tree.
 */
const BLUR_LAYERS = [
  {
    blur: 30,
    mask: "linear-gradient(rgb(0,0,0) 0%, rgba(0,0,0,0) 12.5%)",
  },
  {
    blur: 17.7,
    mask: "linear-gradient(rgb(0,0,0) 0%, rgb(0,0,0) 12.5%, rgba(0,0,0,0) 25%)",
  },
  {
    blur: 10.5,
    mask: "linear-gradient(rgba(0,0,0,0) 0%, rgb(0,0,0) 12.5%, rgb(0,0,0) 25%, rgba(0,0,0,0) 37.5%)",
  },
  {
    blur: 6.2,
    mask: "linear-gradient(rgba(0,0,0,0) 12.5%, rgb(0,0,0) 25%, rgb(0,0,0) 37.5%, rgba(0,0,0,0) 50%)",
  },
  {
    blur: 3.6,
    mask: "linear-gradient(rgba(0,0,0,0) 25%, rgb(0,0,0) 37.5%, rgb(0,0,0) 50%, rgba(0,0,0,0) 62.5%)",
  },
  {
    blur: 2.15,
    mask: "linear-gradient(rgba(0,0,0,0) 37.5%, rgb(0,0,0) 50%, rgb(0,0,0) 62.5%, rgba(0,0,0,0) 75%)",
  },
  {
    blur: 1.27,
    mask: "linear-gradient(rgba(0,0,0,0) 50%, rgb(0,0,0) 62.5%, rgb(0,0,0) 75%, rgba(0,0,0,0) 87.5%)",
  },
  {
    blur: 0.75,
    mask: "linear-gradient(rgba(0,0,0,0) 62.5%, rgb(0,0,0) 75%, rgb(0,0,0) 87.5%, rgba(0,0,0,0) 100%)",
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
              willChange: "backdrop-filter",
              maskImage: layer.mask,
              WebkitMaskImage: layer.mask,
            }}
          />
        ))}
      </div>
    </div>
  );
}

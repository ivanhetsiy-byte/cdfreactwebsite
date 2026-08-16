"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";

import { MOTION_MQ } from "@/lib/motion-env";

/**
 * Progressive frosted edge: stacked backdrop-blur bands masked so blur is
 * strongest at the top and fades downward.
 *
 * Progress is driven via CSS `--nav-blur-progress` (0–1) so scroll updates
 * do not re-render the navbar React tree.
 *
 * On coarse/narrow viewports, backdrop-filter is replaced with a cheap
 * gradient scrim — multi-layer live blur is a major Safari/Chrome GPU cost.
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

function useDesktopFrost() {
  const [desktopFrost, setDesktopFrost] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOTION_MQ.desktopFine);
    const sync = () => setDesktopFrost(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return desktopFrost;
}

export function NavProgressiveBlur({ rootRef }: NavProgressiveBlurProps) {
  const desktopFrost = useDesktopFrost();

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-nav-progressive-blur
      className="pointer-events-none fixed top-0 right-0 left-0 z-[999] h-[100px] md:h-[120px]"
      style={{ "--nav-blur-progress": 0 } as CSSProperties}
    >
      <div className="relative h-full w-full">
        {desktopFrost ? (
          BLUR_LAYERS.map((layer, i) => (
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
          ))
        ) : (
          <div
            className="absolute inset-0"
            style={{
              opacity: "var(--nav-blur-progress, 0)",
              background:
                "linear-gradient(to bottom, color-mix(in srgb, var(--background, #fff) 78%, transparent) 0%, color-mix(in srgb, var(--background, #fff) 42%, transparent) 55%, transparent 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

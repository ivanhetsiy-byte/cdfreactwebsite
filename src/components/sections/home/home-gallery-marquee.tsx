"use client";

import { useLinearMarquee } from "@/hooks/useLinearMarquee";

const GALLERY_THUMB_COUNT = 5;

type HomeGalleryMarqueeProps = {
  className?: string;
};

function GalleryThumb() {
  return (
    <div
      aria-hidden
      className="aspect-[249/309] h-auto w-[20.75vw] shrink-0 bg-[#d9d9d9]"
    />
  );
}

function ThumbSet({ copy }: { copy: number }) {
  return (
    <div
      data-marquee-set
      className="flex shrink-0 items-stretch gap-[1.5vw]"
    >
      {Array.from({ length: GALLERY_THUMB_COUNT }, (_, i) => (
        <GalleryThumb key={`${copy}-${i}`} />
      ))}
    </div>
  );
}

/**
 * Full-bleed gallery track. Linear RTL loop, hover-pause, desktop drag + momentum.
 */
export function HomeGalleryMarquee({ className = "" }: HomeGalleryMarqueeProps) {
  const {
    viewportRef,
    trackRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onMouseEnter,
  } = useLinearMarquee();

  return (
    <div
      ref={viewportRef}
      className={`w-full overflow-hidden ${className}`.trim()}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <div
        ref={trackRef}
        className="flex w-max cursor-grab items-stretch gap-[1.5vw] will-change-transform select-none active:cursor-grabbing"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <ThumbSet copy={0} />
        <ThumbSet copy={1} />
      </div>
    </div>
  );
}

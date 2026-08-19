"use client";

import Image from "next/image";

import { useLinearMarquee } from "@/hooks/useLinearMarquee";

const MIN_THUMB_COUNT = 5;

type HomeGalleryMarqueeProps = {
  className?: string;
  images?: string[];
};

function fillStrip(images: string[]): Array<string | null> {
  if (images.length === 0) {
    return Array.from({ length: MIN_THUMB_COUNT }, () => null);
  }
  if (images.length >= MIN_THUMB_COUNT) return images;
  const strip: string[] = [];
  while (strip.length < MIN_THUMB_COUNT) strip.push(...images);
  return strip;
}

function GalleryThumb({ src }: { src: string | null }) {
  return (
    <div
      aria-hidden
      className="relative aspect-[249/309] h-auto w-[20.75vw] shrink-0 overflow-hidden bg-[#d9d9d9]"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="21vw"
          draggable={false}
          className="pointer-events-none object-cover"
        />
      ) : null}
    </div>
  );
}

function ThumbSet({
  copy,
  images,
}: {
  copy: number;
  images: Array<string | null>;
}) {
  return (
    <div
      data-marquee-set
      className="flex shrink-0 items-stretch gap-[1.5vw]"
    >
      {images.map((src, i) => (
        <GalleryThumb key={`${copy}-${src ?? "ph"}-${i}`} src={src} />
      ))}
    </div>
  );
}

/**
 * Full-bleed gallery track. Linear RTL loop, desktop drag + momentum.
 */
export function HomeGalleryMarquee({
  className = "",
  images = [],
}: HomeGalleryMarqueeProps) {
  const strip = fillStrip(images);
  const {
    viewportRef,
    trackRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  } = useLinearMarquee();

  return (
    <div
      ref={viewportRef}
      className={`w-full overflow-hidden ${className}`.trim()}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={trackRef}
        className="flex w-max cursor-grab items-stretch gap-[1.5vw] will-change-transform select-none active:cursor-grabbing"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <ThumbSet copy={0} images={strip} />
        <ThumbSet copy={1} images={strip} />
      </div>
    </div>
  );
}

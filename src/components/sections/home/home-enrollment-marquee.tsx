"use client";

import Image from "next/image";

import { useLinearMarquee } from "@/hooks/useLinearMarquee";

const MIN_THUMB_COUNT = 6;

type HomeEnrollmentMarqueeProps = {
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

function HeroThumb({ src }: { src: string | null }) {
  return (
    <div
      aria-hidden
      className="relative h-[19.5vw] w-[calc((100cqi-5*1.63vw)/6)] shrink-0 overflow-hidden bg-[#d9d9d9]"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="17vw"
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
      className="flex shrink-0 items-stretch gap-[1.63vw]"
    >
      {images.map((src, i) => (
        <HeroThumb key={`${copy}-${src ?? "ph"}-${i}`} src={src} />
      ))}
    </div>
  );
}

/**
 * Infinitely looping enrollment thumbnail row.
 * Linear auto-scroll (RTL) with mouse-drag + momentum. Drag still takes
 * over the track; hover no longer pauses cruise. Honors reduced motion.
 */
export function HomeEnrollmentMarquee({
  className = "",
  images = [],
}: HomeEnrollmentMarqueeProps) {
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
      className={`@container w-full overflow-hidden ${className}`.trim()}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={trackRef}
        className="flex w-max cursor-grab items-stretch gap-[1.63vw] will-change-transform select-none active:cursor-grabbing"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <ThumbSet copy={0} images={strip} />
        <ThumbSet copy={1} images={strip} />
      </div>
    </div>
  );
}

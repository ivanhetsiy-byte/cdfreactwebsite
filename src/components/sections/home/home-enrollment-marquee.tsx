"use client";

import { useLinearMarquee } from "@/hooks/useLinearMarquee";

const ENROLLMENT_THUMB_COUNT = 6;

type HomeEnrollmentMarqueeProps = {
  className?: string;
};

function HomeMediaPlaceholder() {
  return (
    <div
      aria-hidden
      className="h-[19.5vw] w-[calc((100cqi-5*1.63vw)/6)] shrink-0 bg-[#d9d9d9]"
    />
  );
}

function ThumbSet() {
  return (
    <div
      data-marquee-set
      className="flex shrink-0 items-stretch gap-[1.63vw]"
    >
      {Array.from({ length: ENROLLMENT_THUMB_COUNT }, (_, i) => (
        <HomeMediaPlaceholder key={i} />
      ))}
    </div>
  );
}

/**
 * Infinitely looping enrollment thumbnail row.
 * Linear auto-scroll (RTL) with mouse-drag + momentum. Pauses on hover/drag
 * and resumes from the current transform offset. Honors reduced motion.
 */
export function HomeEnrollmentMarquee({ className = "" }: HomeEnrollmentMarqueeProps) {
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
      className={`@container w-full overflow-hidden ${className}`.trim()}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <div
        ref={trackRef}
        className="flex w-max cursor-grab items-stretch gap-[1.63vw] will-change-transform select-none active:cursor-grabbing"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <ThumbSet />
        <ThumbSet />
      </div>
    </div>
  );
}

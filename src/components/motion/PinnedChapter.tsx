import type { ReactNode } from "react";

type PinnedChapterProps = {
  /** Zero-based index, used to display the watermark numeral (01, 02, …) */
  index: number;
  /** Total chapter count — used to render the correct number of progress dots */
  total: number;
  /** Currently active chapter (0-based) — controls which dot fills brand-red */
  activeIndex?: number;
  /** Optional eyebrow label — hidden on mobile */
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Layout shell for a single chapter inside a pinned scroll sequence.
 *
 * Renders:
 * - Oversized watermark numeral (bottom-right, `aria-hidden`)
 * - Vertical progress dots on the right edge (desktop only)
 * - Optional eyebrow label (desktop only)
 * - `children` slot for heading + body content
 */
export function PinnedChapter({
  index,
  total,
  activeIndex,
  eyebrow,
  children,
  className = "",
}: PinnedChapterProps) {
  const numeral = String(index + 1).padStart(2, "0");
  const active = activeIndex ?? index;

  return (
    <div className={`relative flex flex-col justify-center py-20 md:py-0 ${className}`}>
      {/* Oversized watermark numeral — bottom-right corner, barely visible */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 select-none font-swiss-compressed text-[clamp(6rem,16vw,14rem)] font-black leading-none tracking-tighter text-white/[0.038]"
      >
        {numeral}
      </span>

      {/* Vertical progress dots — right edge, desktop only */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 flex-col gap-[7px] md:flex"
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`block h-[5px] w-[5px] rounded-full transition-colors duration-400 ${
              i === active ? "bg-brand-red" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* Eyebrow — desktop only */}
      {eyebrow && (
        <p className="type-eyebrow mb-8 hidden text-xs font-medium text-white/30 md:block md:text-sm">
          {eyebrow}
        </p>
      )}

      {children}
    </div>
  );
}

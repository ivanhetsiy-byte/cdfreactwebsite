import type { ReactNode } from "react";

const ROLL =
  "col-start-1 row-start-1 block transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

/**
 * Flexion-style text roll: the label slides up on hover and a duplicate
 * slides in from below. Parent must be a `group`. Honors reduced motion.
 */
export function HoverText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`grid overflow-hidden ${className}`.trim()}>
      <span className={`${ROLL} group-hover:-translate-y-full motion-reduce:group-hover:translate-y-0`}>
        {children}
      </span>
      <span
        aria-hidden
        className={`${ROLL} translate-y-full group-hover:translate-y-0 motion-reduce:hidden`}
      >
        {children}
      </span>
    </span>
  );
}

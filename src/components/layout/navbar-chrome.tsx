/** Chrome hamburger / close glyph. */
export function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-7 items-center justify-center" aria-hidden="true">
      <span
        className={`absolute block h-0.5 w-7 bg-current transition-transform duration-300 ease-out ${
          open ? "translate-y-0 rotate-45" : "-translate-y-1.5"
        }`}
      />
      <span
        className={`absolute block h-0.5 w-7 bg-current transition-transform duration-300 ease-out ${
          open ? "translate-y-0 -rotate-45" : "translate-y-1.5"
        }`}
      />
    </span>
  );
}

/**
 * Full word always laid out; clip reveals from the right (RTL on open).
 * Caret sits on the reveal edge — right when opening, left when closing.
 */
export function TypewriterSlot({
  full,
  typed,
  typing,
}: {
  full: string;
  typed: string;
  typing: boolean;
}) {
  const progress = full.length === 0 ? 0 : typed.length / full.length;
  const clipLeft = (1 - progress) * 100;

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        className="inline-block whitespace-nowrap"
        style={{ clipPath: `inset(0 0 0 ${clipLeft}%)` }}
      >
        {full}
      </span>
      {typing ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-[0.85em] w-[0.08em] -translate-y-1/2 bg-current animate-[caret-blink_1.1s_linear_infinite]"
          style={{ left: `${(1 - progress) * 100}%` }}
        />
      ) : null}
    </span>
  );
}

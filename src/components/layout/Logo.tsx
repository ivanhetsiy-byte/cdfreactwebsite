type LogoProps = {
  className?: string;
};

/**
 * Official Figma brand marks (Tw5wUk6sykiLgQf7MG51V1):
 * - Light mode → "Cdf Black" (node 68:10)
 * - Dark mode  → "CDf white" (node 68:29)
 */
export function Logo({ className = "" }: LogoProps) {
  // viewBox 104×77 → height-led scale keeps aspect; theme swap stays on the imgs
  const sizeClass = `block h-[87px] w-auto max-w-none object-contain object-left select-none swiss-no-select ${className}`;

  return (
    <span className="relative inline-flex h-[87px] w-auto shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- crisp SVG brand vectors from Figma */}
      <img
        src="/icons/cdf-black.svg"
        alt="cdf"
        width={104}
        height={77}
        className={`${sizeClass} dark:hidden`}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- crisp SVG brand vectors from Figma */}
      <img
        src="/icons/cdf-white.svg"
        alt="cdf"
        width={104}
        height={77}
        className={`${sizeClass} hidden dark:block`}
        draggable={false}
      />
    </span>
  );
}

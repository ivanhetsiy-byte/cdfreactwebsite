type LogoProps = {
  className?: string;
  /** Force the white mark (e.g. forced-black pages like Staff regardless of theme). */
  forceWhite?: boolean;
  /** Force the black mark (e.g. white menu panel regardless of theme). */
  forceBlack?: boolean;
  /** Always use the white mark for mix-blend-difference chrome. */
  blend?: boolean;
};

/**
 * Official Figma brand marks (Tw5wUk6sykiLgQf7MG51V1):
 * - Light mode → "Cdf Black" (node 68:10)
 * - Dark mode  → "CDf white" (node 68:29)
 */
export function Logo({
  className = "",
  forceWhite = false,
  forceBlack = false,
  blend = false,
}: LogoProps) {
  // Height-led scale keeps aspect; theme swap stays on the imgs
  const sizeClass =
    "block h-full w-auto max-w-none object-contain object-left select-none swiss-no-select";

  const useWhiteOnly = !forceBlack && (blend || forceWhite);
  const useBlackOnly = forceBlack;

  return (
    <span
      className={`relative inline-flex h-[87px] w-auto shrink-0 items-center ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- crisp SVG brand vectors from Figma */}
      <img
        src="/icons/cdf-black.svg"
        alt="cdf"
        width={104}
        height={77}
        className={`${sizeClass} ${
          useBlackOnly
            ? "block"
            : useWhiteOnly
              ? "hidden"
              : "dark:hidden"
        }`}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- crisp SVG brand vectors from Figma */}
      <img
        src="/icons/cdf-white.svg"
        alt="cdf"
        width={104}
        height={77}
        className={`${sizeClass} ${
          useBlackOnly
            ? "hidden"
            : useWhiteOnly
              ? "block"
              : "hidden dark:block"
        }`}
        draggable={false}
      />
    </span>
  );
}

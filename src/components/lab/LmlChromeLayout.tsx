import type { ReactNode } from "react";

import "@/components/lab/lab.css";

type LmlChromeLayoutProps = {
  children: ReactNode;
  /** Dark matches production staff; light is an alternate theme. */
  theme?: "dark" | "light";
};

/** Shared Helvetica chrome for `/staff`. */
export function LmlChromeLayout({
  children,
  theme = "dark",
}: LmlChromeLayoutProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`lml-lab font-swiss antialiased ${
        isLight
          ? "lml-lab-light bg-white text-black"
          : "dark bg-black text-white"
      }`}
      data-theme={isLight ? "light" : "dark"}
      style={{
        colorScheme: isLight ? "light" : "dark",
      }}
    >
      {children}
    </div>
  );
}

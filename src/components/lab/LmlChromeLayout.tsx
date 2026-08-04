import { Syne } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/lab/lab.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lml-display",
  display: "swap",
});

type LmlChromeLayoutProps = {
  children: ReactNode;
  /** Dark matches production staff/lab; light is Staff-2 experiment. */
  theme?: "dark" | "light";
};

/** Shared Syne chrome for `/lab`, `/staff`, and `/staff-2`. */
export function LmlChromeLayout({
  children,
  theme = "dark",
}: LmlChromeLayoutProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`${syne.variable} lml-lab antialiased ${
        isLight
          ? "lml-lab-light bg-white text-black"
          : "dark bg-black text-white"
      }`}
      data-theme={isLight ? "light" : "dark"}
      style={{
        fontFamily: "var(--font-lml-display), Helvetica Neue, Arial, sans-serif",
        colorScheme: isLight ? "light" : "dark",
      }}
    >
      {children}
    </div>
  );
}

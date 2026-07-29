import { Syne } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/lab/lab.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lml-display",
  display: "swap",
});

/** Shared dark Syne chrome for `/lab` and `/staff`. */
export function LmlChromeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${syne.variable} lml-lab dark bg-black text-white antialiased`}
      data-theme="dark"
      style={{
        fontFamily: "var(--font-lml-display), Helvetica Neue, Arial, sans-serif",
        colorScheme: "dark",
      }}
    >
      {children}
    </div>
  );
}

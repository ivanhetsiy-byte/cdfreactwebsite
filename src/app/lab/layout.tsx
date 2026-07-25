import type { Metadata } from "next";
import { Syne } from "next/font/google";

import "./lab.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lml-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LML Studio Lab (temp)",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
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

import { Syne } from "next/font/google";

import "../lab/lab.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lml-display",
  display: "swap",
});

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

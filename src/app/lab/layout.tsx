import type { Metadata } from "next";

import { LmlChromeLayout } from "@/components/lab/LmlChromeLayout";

export const metadata: Metadata = {
  title: "LML Studio Lab (temp)",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LmlChromeLayout>{children}</LmlChromeLayout>;
}

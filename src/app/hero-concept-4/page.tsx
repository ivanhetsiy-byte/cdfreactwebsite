import type { Metadata } from "next";

import { HeroConcept4 } from "@/components/sections/hero-concepts/HeroConcept4";

export const metadata: Metadata = {
  title: "Hero Concept 4 (temp)",
  robots: { index: false, follow: false },
};

export default function HeroConcept4Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-white">
      <HeroConcept4 />
    </main>
  );
}

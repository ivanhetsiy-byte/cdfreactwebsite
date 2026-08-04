import type { Metadata } from "next";

import { HeroConcept5 } from "@/components/sections/hero-concepts/HeroConcept5";

export const metadata: Metadata = {
  title: "Hero Concept 5 (temp)",
  robots: { index: false, follow: false },
};

export default function HeroConcept5Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-white">
      <HeroConcept5 />
    </main>
  );
}

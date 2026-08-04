import type { Metadata } from "next";

import { HeroConcept3 } from "@/components/sections/hero-concepts/HeroConcept3";

export const metadata: Metadata = {
  title: "Hero Concept 3 (temp)",
  robots: { index: false, follow: false },
};

export default function HeroConcept3Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-black">
      <HeroConcept3 />
    </main>
  );
}

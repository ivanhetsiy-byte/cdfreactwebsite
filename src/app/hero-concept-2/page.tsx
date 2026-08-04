import type { Metadata } from "next";

import { HeroConcept2 } from "@/components/sections/hero-concepts/HeroConcept2";

export const metadata: Metadata = {
  title: "Hero Concept 2 (temp)",
  robots: { index: false, follow: false },
};

export default function HeroConcept2Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-black">
      <HeroConcept2 />
    </main>
  );
}

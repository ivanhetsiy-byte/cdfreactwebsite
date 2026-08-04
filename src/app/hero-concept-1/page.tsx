import type { Metadata } from "next";

import { HeroConcept1 } from "@/components/sections/hero-concepts/HeroConcept1";

export const metadata: Metadata = {
  title: "Hero Concept 1 (temp)",
  robots: { index: false, follow: false },
};

export default function HeroConcept1Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-black">
      <HeroConcept1 />
    </main>
  );
}

import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";

export const metadata: Metadata = {
  title: "Light Rays Lab (temp)",
  robots: { index: false, follow: false },
};

export default function LightRaysLabRoute() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <Navbar />
      <main id="main-content" className="relative w-full">
        <Hero />
      </main>
    </div>
  );
}

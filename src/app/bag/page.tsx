import type { Metadata } from "next";

import { BagPage } from "@/components/sections/bag-page";

export const metadata: Metadata = {
  title: "Bag",
};

export default function Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-black text-white">
      <BagPage />
    </main>
  );
}

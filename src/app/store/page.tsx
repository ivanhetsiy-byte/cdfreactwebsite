import type { Metadata } from "next";

import { StoreWireframes } from "@/components/sections/store-wireframes";

export const metadata: Metadata = {
  title: "Store",
};

export default function Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-black text-white">
      <StoreWireframes />
    </main>
  );
}

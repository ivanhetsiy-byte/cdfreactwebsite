import type { Metadata } from "next";

import { BagPage } from "@/components/sections/bag-page";

export const metadata: Metadata = {
  title: "Bag",
  description:
    "Your Childrens Dance Factory bag — review studio apparel before checkout.",
};

export default function Page() {
  return (
    <main id="main-content" className="relative w-full min-h-screen bg-black text-white">
      <BagPage />
    </main>
  );
}

import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { AboutWireframes } from "@/components/sections/about-page";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Childrens Dance Factory — our mission, programs, and studio community.",
};

export default function Page() {
  return (
    <PageShell className="!bg-white !pt-0 !px-0 !pb-0 md:!p-0 !text-black">
      <AboutWireframes />
    </PageShell>
  );
}

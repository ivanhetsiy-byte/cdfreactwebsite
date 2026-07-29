import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { AboutWireframes } from "@/components/sections/about-page";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Childance Factory — our mission, programs, and studio community.",
};

export default function Page() {
  return (
    <PageShell>
      <AboutWireframes />
    </PageShell>
  );
}

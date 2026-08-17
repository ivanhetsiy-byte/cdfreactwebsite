import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { ContactWireframes } from "@/components/sections/contact-page";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Childrens Dance Factory — get in touch about classes, enrollment, and studio visits.",
};

export default function Page() {
  return (
    <PageShell className="!pb-0">
      <ContactWireframes />
    </PageShell>
  );
}

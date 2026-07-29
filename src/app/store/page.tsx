import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { StoreWireframes } from "@/components/sections/store-page";

export const metadata: Metadata = {
  title: "Store",
  description: "Official Childance Factory studio apparel and accessories.",
};

export default function Page() {
  return (
    <PageShell variant="dark">
      <StoreWireframes />
    </PageShell>
  );
}

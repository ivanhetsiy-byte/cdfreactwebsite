import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { StoreWireframes } from "@/components/sections/store-page";
import { loadStoreCatalog } from "@/lib/store-catalog.server";

export const metadata: Metadata = {
  title: "Store",
  description: "Official Childrens Dance Factory studio apparel and accessories.",
};

/** Re-read local catalog on each request during development. */
export const dynamic = "force-dynamic";

export default function Page() {
  const products = loadStoreCatalog();

  return (
    <PageShell variant="dark">
      <StoreWireframes products={products} />
    </PageShell>
  );
}

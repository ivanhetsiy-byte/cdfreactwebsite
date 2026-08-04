import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreAdminPortal } from "@/components/lab/store-admin/StoreAdminPortal";
import { loadStoreCatalog } from "@/lib/store-catalog.server";

export const metadata: Metadata = {
  title: "Store Admin (local)",
  robots: { index: false, follow: false },
};

export default function StoreAdminLabRoute() {
  if (process.env.NODE_ENV === "production") notFound();

  return <StoreAdminPortal initialProducts={loadStoreCatalog()} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreProductDetail } from "@/components/sections/store-product-detail";
import {
  loadStoreProduct,
  loadStoreProductIds,
} from "@/lib/store-catalog.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Re-read local catalog on each request during development. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return loadStoreProductIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = loadStoreProduct(id);
  if (!product) return { title: "Store" };
  return {
    title: product.title,
    description:
      product.description.trim() ||
      `${product.title} — official Childrens Dance Factory store.`,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const product = loadStoreProduct(id);
  if (!product) notFound();

  return (
    <main
      id="main-content"
      className="relative w-full min-h-screen bg-black text-white"
    >
      <StoreProductDetail product={product} />
    </main>
  );
}

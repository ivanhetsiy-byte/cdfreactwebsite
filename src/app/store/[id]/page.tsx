import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreProductDetail } from "@/components/sections/store-product-detail";
import {
  getStoreProduct,
  getStoreProductIds,
} from "@/lib/store-products";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getStoreProductIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getStoreProduct(id);
  if (!product) return { title: "Store" };
  return { title: product.title };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const product = getStoreProduct(id);
  if (!product) notFound();

  return (
    <main id="main-content" className="relative w-full min-h-screen bg-black text-white">
      <StoreProductDetail product={product} />
    </main>
  );
}

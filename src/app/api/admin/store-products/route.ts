import { NextResponse } from "next/server";

import {
  loadStoreCatalog,
  writeLocalStoreCatalog,
} from "@/lib/store-catalog.server";
import { parseStoreProduct, type StoreProduct } from "@/lib/store-products";

function denyUnlessDev() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function GET() {
  const denied = denyUnlessDev();
  if (denied) return denied;

  return NextResponse.json({ products: loadStoreCatalog() });
}

export async function PUT(request: Request) {
  const denied = denyUnlessDev();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const productsRaw =
    body && typeof body === "object" && "products" in body
      ? (body as { products: unknown }).products
      : null;

  if (!Array.isArray(productsRaw)) {
    return NextResponse.json(
      { error: "Expected { products: StoreProduct[] }" },
      { status: 400 },
    );
  }

  const products: StoreProduct[] = [];
  const seen = new Set<string>();

  for (const entry of productsRaw) {
    const product = parseStoreProduct(entry);
    if (!product) {
      return NextResponse.json(
        { error: "One or more products failed validation" },
        { status: 400 },
      );
    }
    if (seen.has(product.id)) {
      return NextResponse.json(
        { error: `Duplicate product id: ${product.id}` },
        { status: 400 },
      );
    }
    if (product.sizes.length === 0) {
      return NextResponse.json(
        { error: `Product "${product.id}" needs at least one size` },
        { status: 400 },
      );
    }
    seen.add(product.id);
    products.push(product);
  }

  try {
    writeLocalStoreCatalog(products);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to write catalog",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ products, saved: true });
}

export type ProductAspect = "portrait" | "square" | "landscape";

export type StoreProduct = {
  id: string;
  title: string;
  price: string;
  aspect: ProductAspect;
  description: string;
  sizes: readonly string[];
  specs: readonly { label: string; value: string }[];
};

/**
 * Production catalog — intentionally empty until products ship.
 * Local development can overlay products via `data/store-products.local.json`
 * (see `loadStoreCatalog` in store-catalog.server.ts).
 */
export const STORE_PRODUCTS: readonly StoreProduct[] = [];

export function getStoreProduct(id: string): StoreProduct | undefined {
  return STORE_PRODUCTS.find((product) => product.id === id);
}

export function getStoreProductIds(): string[] {
  return STORE_PRODUCTS.map((product) => product.id);
}

export function slugifyProductId(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function isProductAspect(value: string): value is ProductAspect {
  return value === "portrait" || value === "square" || value === "landscape";
}

/** Loose runtime check used by the local admin API. */
export function parseStoreProduct(raw: unknown): StoreProduct | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.id !== "string" || !p.id.trim()) return null;
  if (typeof p.title !== "string" || !p.title.trim()) return null;
  if (typeof p.price !== "string" || !p.price.trim()) return null;
  if (typeof p.aspect !== "string" || !isProductAspect(p.aspect)) return null;
  if (typeof p.description !== "string") return null;
  if (!Array.isArray(p.sizes) || p.sizes.some((s) => typeof s !== "string")) {
    return null;
  }
  if (!Array.isArray(p.specs)) return null;
  const specs: { label: string; value: string }[] = [];
  for (const row of p.specs) {
    if (!row || typeof row !== "object") return null;
    const spec = row as Record<string, unknown>;
    if (typeof spec.label !== "string" || typeof spec.value !== "string") {
      return null;
    }
    specs.push({ label: spec.label, value: spec.value });
  }
  return {
    id: p.id.trim(),
    title: p.title.trim(),
    price: p.price.trim(),
    aspect: p.aspect,
    description: p.description,
    sizes: p.sizes.map((s) => String(s).trim()).filter(Boolean),
    specs,
  };
}

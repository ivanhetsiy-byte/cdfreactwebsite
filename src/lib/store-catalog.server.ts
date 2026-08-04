import fs from "node:fs";
import path from "node:path";

import {
  parseStoreProduct,
  STORE_PRODUCTS,
  type StoreProduct,
} from "@/lib/store-products";

export const LOCAL_STORE_PRODUCTS_PATH = path.join(
  process.cwd(),
  "data",
  "store-products.local.json",
);

function readLocalCatalog(): StoreProduct[] {
  if (process.env.NODE_ENV !== "development") return [];
  try {
    if (!fs.existsSync(LOCAL_STORE_PRODUCTS_PATH)) return [];
    const raw = JSON.parse(
      fs.readFileSync(LOCAL_STORE_PRODUCTS_PATH, "utf8"),
    ) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .map(parseStoreProduct)
      .filter((product): product is StoreProduct => product !== null);
  } catch {
    return [];
  }
}

/** Production: committed catalog. Development: local JSON overlay when present. */
export function loadStoreCatalog(): StoreProduct[] {
  const local = readLocalCatalog();
  if (local.length > 0) return local;
  return [...STORE_PRODUCTS];
}

export function loadStoreProduct(id: string): StoreProduct | undefined {
  return loadStoreCatalog().find((product) => product.id === id);
}

export function loadStoreProductIds(): string[] {
  return loadStoreCatalog().map((product) => product.id);
}

export function writeLocalStoreCatalog(products: StoreProduct[]): void {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Local store catalog writes are development-only.");
  }
  const dir = path.dirname(LOCAL_STORE_PRODUCTS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    LOCAL_STORE_PRODUCTS_PATH,
    `${JSON.stringify(products, null, 2)}\n`,
    "utf8",
  );
}

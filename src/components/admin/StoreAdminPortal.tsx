"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import {
  slugifyProductId,
  type ProductAspect,
  type StoreProduct,
} from "@/lib/store-products";

const ASPECTS: ProductAspect[] = ["portrait", "square", "landscape"];
const DEFAULT_SIZES = "XS, S, M, L, XL";

type SpecDraft = { label: string; value: string };

type ProductDraft = {
  id: string;
  title: string;
  price: string;
  aspect: ProductAspect;
  description: string;
  sizesText: string;
  specs: SpecDraft[];
};

function toDraft(product: StoreProduct): ProductDraft {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    aspect: product.aspect,
    description: product.description,
    sizesText: product.sizes.join(", "),
    specs: product.specs.map((spec) => ({ ...spec })),
  };
}

function emptyDraft(): ProductDraft {
  return {
    id: "",
    title: "",
    price: "$",
    aspect: "square",
    description: "",
    sizesText: DEFAULT_SIZES,
    specs: [{ label: "", value: "" }],
  };
}

function fromDraft(draft: ProductDraft): StoreProduct | null {
  const sizes = draft.sizesText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const id = draft.id.trim() || slugifyProductId(draft.title);
  if (!id || !draft.title.trim() || !draft.price.trim() || sizes.length === 0) {
    return null;
  }
  return {
    id,
    title: draft.title.trim(),
    price: draft.price.trim(),
    aspect: draft.aspect,
    description: draft.description,
    sizes,
    specs: draft.specs
      .map((spec) => ({
        label: spec.label.trim(),
        value: spec.value.trim(),
      }))
      .filter((spec) => spec.label && spec.value),
  };
}

const fieldClass =
  "w-full rounded-none border border-white/20 bg-black px-3 py-2 font-swiss text-sm text-white outline-none focus:border-white/60";
const labelClass = "mb-1 block font-swiss text-xs tracking-wide text-white/50";

export function StoreAdminPortal({
  initialProducts,
}: {
  initialProducts: StoreProduct[];
}) {
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.title.localeCompare(b.title)),
    [products],
  );

  const resetForm = () => {
    setDraft(emptyDraft());
    setEditingId(null);
  };

  const startEdit = (product: StoreProduct) => {
    setEditingId(product.id);
    setDraft(toDraft(product));
    setError(null);
    setStatus(null);
  };

  const upsertDraft = () => {
    const next = fromDraft(draft);
    if (!next) {
      setError("Title, price, and at least one size are required.");
      return;
    }

    setProducts((prev) => {
      const without = prev.filter(
        (product) => product.id !== editingId && product.id !== next.id,
      );
      return [...without, next];
    });
    setStatus(
      editingId ? `Updated “${next.title}” (not saved to disk yet).` : `Added “${next.title}” (not saved to disk yet).`,
    );
    setError(null);
    resetForm();
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    if (editingId === id) resetForm();
    setStatus(`Removed “${id}” (not saved to disk yet).`);
  };

  const saveToDisk = () => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/store-products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products }),
        });
        const data = (await res.json()) as {
          products?: StoreProduct[];
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "Save failed");
          return;
        }
        setProducts(data.products ?? products);
        setStatus(
          `Saved ${data.products?.length ?? products.length} product(s) to data/store-products.local.json. Refresh /store to see them.`,
        );
      } catch {
        setError("Network error while saving.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10 md:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-white/15 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-swiss text-xs tracking-[0.2em] text-white/40 uppercase">
              Local development only
            </p>
            <h1 className="mt-2 font-swiss text-3xl font-bold tracking-tight md:text-4xl">
              Store Admin
            </h1>
            <p className="mt-2 max-w-xl font-swiss text-sm text-white/55">
              Add products for local preview. Saves to a gitignored JSON file and
              404s in production. Committed catalog stays empty.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media"
              className="border border-white/30 px-4 py-2 font-swiss text-sm hover:bg-white hover:text-black"
            >
              Media
            </Link>
            <Link
              href="/store"
              className="border border-white/30 px-4 py-2 font-swiss text-sm hover:bg-white hover:text-black"
            >
              Open store
            </Link>
            <button
              type="button"
              onClick={saveToDisk}
              disabled={pending}
              className="border border-white bg-white px-4 py-2 font-swiss text-sm font-medium text-black disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save to disk"}
            </button>
          </div>
        </header>

        {(status || error) && (
          <p
            className={`font-swiss text-sm ${error ? "text-red-400" : "text-white/70"}`}
            role="status"
          >
            {error ?? status}
          </p>
        )}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section aria-labelledby="catalog-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="catalog-heading"
                className="font-swiss text-lg font-medium"
              >
                Catalog ({sorted.length})
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="font-swiss text-sm text-white/60 underline-offset-2 hover:text-white hover:underline"
              >
                New product
              </button>
            </div>

            {sorted.length === 0 ? (
              <p className="border border-dashed border-white/20 px-4 py-10 text-center font-swiss text-sm text-white/45">
                No local products yet. Use the form to add one, then save.
              </p>
            ) : (
              <ul className="divide-y divide-white/10 border border-white/15">
                {sorted.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-swiss text-sm font-medium">
                        {product.title}
                      </p>
                      <p className="mt-1 font-swiss text-xs text-white/45">
                        {product.price} · {product.aspect} · {product.id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        className="border border-white/25 px-3 py-1.5 font-swiss text-xs hover:border-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="border border-white/25 px-3 py-1.5 font-swiss text-xs text-red-300 hover:border-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="editor-heading"
            className="border border-white/15 p-5 md:p-6"
          >
            <h2 id="editor-heading" className="font-swiss text-lg font-medium">
              {editingId ? "Edit product" : "Add product"}
            </h2>

            <div className="mt-5 grid gap-4">
              <div>
                <label className={labelClass} htmlFor="product-title">
                  Title
                </label>
                <input
                  id="product-title"
                  className={fieldClass}
                  value={draft.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      title,
                      id:
                        editingId || prev.id
                          ? prev.id
                          : slugifyProductId(title),
                    }));
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="product-id">
                    ID (slug)
                  </label>
                  <input
                    id="product-id"
                    className={fieldClass}
                    value={draft.id}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, id: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="product-price">
                    Price
                  </label>
                  <input
                    id="product-price"
                    className={fieldClass}
                    value={draft.price}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="$36"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="product-aspect">
                    Aspect
                  </label>
                  <select
                    id="product-aspect"
                    className={fieldClass}
                    value={draft.aspect}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        aspect: e.target.value as ProductAspect,
                      }))
                    }
                  >
                    {ASPECTS.map((aspect) => (
                      <option key={aspect} value={aspect}>
                        {aspect}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="product-sizes">
                    Sizes (comma-separated)
                  </label>
                  <input
                    id="product-sizes"
                    className={fieldClass}
                    value={draft.sizesText}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        sizesText: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="product-description">
                  Description
                </label>
                <textarea
                  id="product-description"
                  className={`${fieldClass} min-h-24 resize-y`}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className={labelClass}>Specs</p>
                  <button
                    type="button"
                    className="font-swiss text-xs text-white/60 hover:text-white"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        specs: [...prev.specs, { label: "", value: "" }],
                      }))
                    }
                  >
                    Add row
                  </button>
                </div>
                <div className="grid gap-2">
                  {draft.specs.map((spec, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        className={fieldClass}
                        placeholder="Label"
                        value={spec.label}
                        onChange={(e) =>
                          setDraft((prev) => {
                            const specs = [...prev.specs];
                            specs[index] = {
                              ...specs[index]!,
                              label: e.target.value,
                            };
                            return { ...prev, specs };
                          })
                        }
                      />
                      <input
                        className={fieldClass}
                        placeholder="Value"
                        value={spec.value}
                        onChange={(e) =>
                          setDraft((prev) => {
                            const specs = [...prev.specs];
                            specs[index] = {
                              ...specs[index]!,
                              value: e.target.value,
                            };
                            return { ...prev, specs };
                          })
                        }
                      />
                      <button
                        type="button"
                        className="border border-white/20 px-2 text-xs text-white/50 hover:text-white"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            specs: prev.specs.filter((_, i) => i !== index),
                          }))
                        }
                        aria-label="Remove spec row"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={upsertDraft}
                  className="border border-white bg-white px-4 py-2 font-swiss text-sm font-medium text-black"
                >
                  {editingId ? "Update in list" : "Add to list"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-white/30 px-4 py-2 font-swiss text-sm"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

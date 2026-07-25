"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useBag } from "@/context/BagContext";
import { requestRouteCover } from "@/lib/route-cover";
import type { StoreProduct } from "@/lib/store-products";

const ASPECT_CLASS = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
} as const;

type StoreProductDetailProps = {
  product: StoreProduct;
};

export function StoreProductDetail({ product }: StoreProductDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useBag();
  const navLockRef = useRef(false);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);

  const goStore = () => {
    if (pathname === "/store" || navLockRef.current) return;
    navLockRef.current = true;
    requestRouteCover();
    setTimeout(() => {
      router.push("/store");
      navLockRef.current = false;
    }, 500);
  };

  const handleAdd = () => {
    if (!size) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      size,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <section className="relative w-full bg-black px-5 pt-[130px] pb-32 text-white md:px-6.5 md:pb-40">
      <button
        type="button"
        onClick={goStore}
        className="mb-10 font-swiss text-sm text-white/50 transition-colors duration-150 hover:text-white md:mb-14"
      >
        ← Store
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
        <div
          className={`relative w-full overflow-hidden bg-white ${ASPECT_CLASS[product.aspect]}`}
          aria-hidden
        />

        <div className="flex min-w-0 flex-col lg:pt-2">
          <h1 className="font-swiss text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.1] tracking-tight text-white">
            {product.title}
          </h1>
          <p className="mt-3 font-swiss text-lg text-white/50 md:text-xl">
            {product.price}
          </p>
          <p className="mt-6 max-w-md font-swiss text-[0.95rem] leading-relaxed text-white/70 md:text-base">
            {product.description}
          </p>

          <fieldset className="mt-10 border-0 p-0">
            <legend className="font-swiss text-xs font-medium tracking-[0.24em] text-white/40 uppercase">
              Size
            </legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.sizes.map((option) => {
                const selected = size === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    aria-pressed={selected}
                    className={`min-w-[3rem] border px-3.5 py-2.5 font-swiss text-sm transition-colors duration-150 ${
                      selected
                        ? "border-white bg-white text-black"
                        : "border-white/25 text-white hover:border-white/60"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-10 w-full max-w-sm border border-white bg-white px-6 py-4 font-swiss text-sm font-medium tracking-[0.18em] text-black uppercase transition-colors duration-150 hover:bg-transparent hover:text-white md:mt-12"
          >
            {added ? "Added to bag" : "Add to bag"}
          </button>

          <div className="mt-14 border-t border-white/15 pt-8 md:mt-16">
            <h2 className="font-swiss text-xs font-medium tracking-[0.24em] text-white/40 uppercase">
              Specifications
            </h2>
            <dl className="mt-5 space-y-0">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-white/10 py-3.5 md:grid-cols-[9rem_1fr]"
                >
                  <dt className="font-swiss text-sm text-white/40">
                    {spec.label}
                  </dt>
                  <dd className="font-swiss text-sm text-white/85">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-10 font-swiss text-sm text-white/35">
            Selected size:{" "}
            <span className="text-white/70">{size || "—"}</span>
            {" · "}
            <Link
              href="/contact"
              className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
            >
              Questions? Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

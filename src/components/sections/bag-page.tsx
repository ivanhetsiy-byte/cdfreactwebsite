"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { useBag } from "@/context/BagContext";
import { formatMoney, MAX_BAG_QUANTITY, parsePrice } from "@/lib/bag";
import { requestRouteCover } from "@/lib/route-cover";

export function BagPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { items, count, subtotal, removeItem, setQuantity, clear } = useBag();
  const navLockRef = useRef(false);

  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const go = (targetPath: string) => {
    if (targetPath === pathname || navLockRef.current) return;
    navLockRef.current = true;
    requestRouteCover();
    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, 500);
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || items.length === 0) return;

    const trimmed = lastName.trim();
    if (!trimmed) {
      setError("Last name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName: trimmed }),
      });
      const verifyData = (await verifyRes.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!verifyRes.ok || !verifyData.ok) {
        setError(verifyData.error || "Last name not found.");
        setSubmitting(false);
        return;
      }

      const orderRes = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: trimmed,
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });
      const orderData = (await orderRes.json()) as {
        ok?: boolean;
        error?: string;
        subtotal?: number;
      };

      if (!orderRes.ok || !orderData.ok) {
        setError(orderData.error || "Failed to submit order. Please try again.");
        setSubmitting(false);
        return;
      }

      setConfirmedName(trimmed);
      setConfirmedTotal(
        typeof orderData.subtotal === "number" ? orderData.subtotal : subtotal,
      );
      clear();
      setLastName("");
      setConfirmed(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <section className="relative w-full bg-black px-5 pt-[130px] pb-32 text-white md:px-6.5 md:pb-40">
        <p className="font-swiss text-xs font-medium tracking-[0.24em] text-white/40 uppercase">
          Request received
        </p>
        <h1 className="mt-4 font-swiss text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[1.05] tracking-tight">
          Thank you, {confirmedName}
        </h1>
        <p className="mt-5 max-w-md font-swiss text-[0.95rem] leading-relaxed text-white/70 md:text-base">
          Your request for {formatMoney(confirmedTotal)} was submitted. Payment
          is in person at the studio — the team will follow up using your family
          record to arrange pickup.
        </p>
        <button
          type="button"
          onClick={() => go("/store")}
          className="mt-12 border border-white bg-white px-6 py-4 font-swiss text-sm font-medium tracking-[0.18em] text-black uppercase transition-colors duration-150 hover:bg-transparent hover:text-white"
        >
          Back to store
        </button>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-black px-5 pt-[130px] pb-32 text-white md:px-6.5 md:pb-40">
      <button
        type="button"
        onClick={() => go("/store")}
        className="mb-10 font-swiss text-sm text-white/50 transition-colors duration-150 hover:text-white md:mb-14"
      >
        ← Store
      </button>

      <h1 className="font-swiss text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[1.05] tracking-tight">
        Bag
      </h1>
      <p className="mt-3 font-swiss text-sm text-white/45 md:text-base">
        {count === 0
          ? "Your bag is empty."
          : `${count} ${count === 1 ? "item" : "items"}`}
      </p>

      {items.length === 0 ? (
        <div className="mt-14">
          <Link
            href="/store"
            onClick={(e) => {
              e.preventDefault();
              go("/store");
            }}
            className="inline-flex border border-white bg-white px-6 py-4 font-swiss text-sm font-medium tracking-[0.18em] text-black uppercase transition-colors duration-150 hover:bg-transparent hover:text-white"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_22rem] lg:gap-20 xl:grid-cols-[1fr_26rem]">
          <ul className="m-0 list-none space-y-0 p-0">
            {items.map((item) => {
              const lineTotal = parsePrice(item.price) * item.quantity;
              return (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="border-t border-white/15 py-6 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-swiss text-lg font-medium leading-snug tracking-tight md:text-xl">
                        {item.title}
                      </h2>
                      <p className="mt-1.5 font-swiss text-sm text-white/45">
                        Size {item.size} · {item.price} each
                      </p>
                    </div>
                    <p className="shrink-0 font-swiss text-base text-white/85 sm:text-right">
                      {formatMoney(lineTotal)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <div className="flex items-center border border-white/25">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          setQuantity(
                            item.productId,
                            item.size,
                            item.quantity - 1,
                          )
                        }
                        className="px-3 py-2 font-swiss text-sm text-white/70 transition-colors hover:text-white"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center font-swiss text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= MAX_BAG_QUANTITY}
                        onClick={() =>
                          setQuantity(
                            item.productId,
                            item.size,
                            item.quantity + 1,
                          )
                        }
                        className="px-3 py-2 font-swiss text-sm text-white/70 transition-colors hover:text-white disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.size)}
                      className="font-swiss text-sm text-white/40 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/50"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="border-t border-white/15 pt-6 lg:border lg:border-white/15 lg:p-6 lg:pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-swiss text-xs font-medium tracking-[0.24em] text-white/40 uppercase">
                  Subtotal
                </p>
                <p className="font-swiss text-xl font-medium tracking-tight">
                  {formatMoney(subtotal)}
                </p>
              </div>

              <form onSubmit={handleCheckout} className="mt-8">
                <label className="block">
                  <span className="font-swiss text-xs font-medium tracking-[0.24em] text-white/40 uppercase">
                    Last name
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Family last name"
                    className="mt-3 w-full border-0 border-b border-white/30 bg-transparent py-3 font-swiss text-base text-white placeholder:text-white/30 focus:border-white focus:outline-none"
                    required
                  />
                </label>
                <p className="mt-3 font-swiss text-xs leading-relaxed text-white/35">
                  Checkout is limited to families on our roster. Enter the last
                  name on file to submit your request. Payment is in person at
                  the studio after your request is approved.
                </p>

                {error ? (
                  <p
                    role="alert"
                    className="mt-4 font-swiss text-sm text-[#ff6b6b]"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="mt-8 w-full border border-white bg-white px-6 py-4 font-swiss text-sm font-medium tracking-[0.18em] text-black uppercase transition-colors duration-150 hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
                >
                  {submitting ? "Submitting…" : "Submit request"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

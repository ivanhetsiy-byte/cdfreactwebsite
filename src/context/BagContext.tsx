"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { MAX_BAG_QUANTITY, parsePrice } from "@/lib/bag";

const STORAGE_KEY = "cdf-bag";

export type BagItem = {
  productId: string;
  title: string;
  price: string;
  size: string;
  quantity: number;
};

type BagContextValue = {
  items: BagItem[];
  /** Total units in the bag (sum of quantities). */
  count: number;
  /** Sum of line totals in dollars. */
  subtotal: number;
  addItem: (item: Omit<BagItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);

function readStored(): BagItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is BagItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as BagItem).productId === "string" &&
        typeof (item as BagItem).size === "string" &&
        typeof (item as BagItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

function clampQty(n: number) {
  return Math.max(1, Math.min(MAX_BAG_QUANTITY, Math.floor(n)));
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<BagItem, "quantity"> & { quantity?: number }) => {
      const qty = clampQty(item.quantity ?? 1);
      setItems((prev) => {
        const idx = prev.findIndex(
          (row) => row.productId === item.productId && row.size === item.size,
        );
        if (idx === -1) {
          return [...prev, { ...item, quantity: qty }];
        }
        return prev.map((row, i) =>
          i === idx
            ? { ...row, quantity: clampQty(row.quantity + qty) }
            : row,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) =>
      prev.filter((row) => !(row.productId === productId && row.size === size)),
    );
  }, []);

  const setQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity < 1) {
        setItems((prev) =>
          prev.filter(
            (row) => !(row.productId === productId && row.size === size),
          ),
        );
        return;
      }
      const qty = clampQty(quantity);
      setItems((prev) =>
        prev.map((row) =>
          row.productId === productId && row.size === size
            ? { ...row, quantity: qty }
            : row,
        ),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + parsePrice(item.price) * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [items, count, subtotal, addItem, removeItem, setQuantity, clear],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) {
    throw new Error("useBag must be used within BagProvider");
  }
  return ctx;
}

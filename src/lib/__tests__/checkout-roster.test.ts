import { afterEach, describe, expect, it } from "vitest";

import {
  getCheckoutRoster,
  isLastNameOnRoster,
  normalizeLastName,
} from "@/lib/checkout-roster";
import {
  getStoreProduct,
  getStoreProductIds,
  STORE_PRODUCTS,
} from "@/lib/store-products";

describe("normalizeLastName", () => {
  it("trims and lowercases", () => {
    expect(normalizeLastName("  Smith  ")).toBe("smith");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeLastName("Van  Der  Berg")).toBe("van der berg");
  });
});

describe("checkout roster", () => {
  afterEach(() => {
    delete process.env.CHECKOUT_LAST_NAMES;
  });

  it("parses comma-separated names", () => {
    process.env.CHECKOUT_LAST_NAMES = "Smith, Johnson , Lee";
    const roster = getCheckoutRoster();
    expect(roster.has("smith")).toBe(true);
    expect(roster.has("johnson")).toBe(true);
    expect(roster.has("lee")).toBe(true);
  });

  it("matches case-insensitively", () => {
    process.env.CHECKOUT_LAST_NAMES = "Smith";
    expect(isLastNameOnRoster("SMITH")).toBe(true);
    expect(isLastNameOnRoster("jones")).toBe(false);
  });

  it("rejects empty names", () => {
    process.env.CHECKOUT_LAST_NAMES = "Smith";
    expect(isLastNameOnRoster("   ")).toBe(false);
  });
});

describe("store catalog", () => {
  it("starts empty in the committed catalog", () => {
    expect(STORE_PRODUCTS).toHaveLength(0);
    expect(getStoreProductIds()).toHaveLength(0);
    expect(getStoreProduct("missing-product")).toBeUndefined();
  });
});

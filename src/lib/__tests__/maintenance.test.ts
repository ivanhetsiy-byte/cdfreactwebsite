import { afterEach, describe, expect, it } from "vitest";

import {
  getPreviewSecret,
  hasValidPreviewCookie,
  isMaintenanceMode,
  previewCookieValue,
  secretsMatch,
} from "@/lib/maintenance";

describe("isMaintenanceMode", () => {
  const originalMode = process.env.MAINTENANCE_MODE;

  afterEach(() => {
    if (originalMode === undefined) delete process.env.MAINTENANCE_MODE;
    else process.env.MAINTENANCE_MODE = originalMode;
  });

  it("is off when MAINTENANCE_MODE=false", () => {
    process.env.MAINTENANCE_MODE = "false";
    expect(isMaintenanceMode()).toBe(false);
  });

  it("is on when MAINTENANCE_MODE=true", () => {
    process.env.MAINTENANCE_MODE = "true";
    expect(isMaintenanceMode()).toBe(true);
  });
});

describe("preview secret helpers", () => {
  const originalCode = process.env.MAINTENANCE_PREVIEW_CODE;

  afterEach(() => {
    if (originalCode === undefined) delete process.env.MAINTENANCE_PREVIEW_CODE;
    else process.env.MAINTENANCE_PREVIEW_CODE = originalCode;
  });

  it("treats blank preview code as unset", () => {
    process.env.MAINTENANCE_PREVIEW_CODE = "   ";
    expect(getPreviewSecret()).toBeUndefined();
  });

  it("matches secrets in constant time without leaking length via throw", () => {
    expect(secretsMatch("season12", "season12")).toBe(true);
    expect(secretsMatch("season12", "season13")).toBe(false);
    expect(secretsMatch("short", "much-longer-secret")).toBe(false);
  });

  it("accepts only the HMAC cookie for the configured secret", async () => {
    process.env.MAINTENANCE_PREVIEW_CODE = "preview-test";
    const token = await previewCookieValue("preview-test");
    expect(await hasValidPreviewCookie(token)).toBe(true);
    expect(await hasValidPreviewCookie("1")).toBe(false);
    expect(await hasValidPreviewCookie(undefined)).toBe(false);

    process.env.MAINTENANCE_PREVIEW_CODE = "other-secret";
    expect(await hasValidPreviewCookie(token)).toBe(false);
  });

  it("rejects cookies when no secret is configured", async () => {
    delete process.env.MAINTENANCE_PREVIEW_CODE;
    expect(await hasValidPreviewCookie("anything")).toBe(false);
  });
});

/**
 * Production maintenance gate.
 * - Local `next dev` → off, unless MAINTENANCE_MODE=true
 * - Production → on, unless MAINTENANCE_MODE=false
 */
export const PREVIEW_COOKIE = "cdf-preview";
export const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const PREVIEW_HMAC_MESSAGE = "cdf-preview-bypass";

export function isMaintenanceMode(): boolean {
  if (process.env.MAINTENANCE_MODE === "false") return false;
  if (process.env.MAINTENANCE_MODE === "true") return true;
  if (process.env.NODE_ENV === "development") return false;
  return true;
}

export function getPreviewSecret(): string | undefined {
  const value = process.env.MAINTENANCE_PREVIEW_CODE?.trim();
  return value ? value : undefined;
}

export function secretsMatch(submitted: string, secret: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(submitted);
  const b = encoder.encode(secret);
  const len = Math.max(a.length, b.length, 1);
  const aa = new Uint8Array(len);
  const bb = new Uint8Array(len);
  aa.set(a);
  bb.set(b);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return mismatch === 0;
}

export async function previewCookieValue(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(PREVIEW_HMAC_MESSAGE),
  );
  return [...new Uint8Array(sig)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function hasValidPreviewCookie(
  value: string | undefined,
): Promise<boolean> {
  const secret = getPreviewSecret();
  if (!secret || !value) return false;
  const expected = await previewCookieValue(secret);
  return hexEqual(value, expected);
}

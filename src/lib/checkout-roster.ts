/** Normalize last names for roster comparison (trim + case-insensitive). */
export function normalizeLastName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Server-only roster from CHECKOUT_LAST_NAMES (comma-separated). */
export function getCheckoutRoster(): Set<string> {
  const raw = process.env.CHECKOUT_LAST_NAMES ?? "";
  const names = raw
    .split(",")
    .map((part) => normalizeLastName(part))
    .filter(Boolean);
  return new Set(names);
}

export function isLastNameOnRoster(lastName: string): boolean {
  const normalized = normalizeLastName(lastName);
  if (!normalized) return false;
  return getCheckoutRoster().has(normalized);
}

/**
 * Production maintenance gate.
 * - Local `next dev` → always off
 * - Production → on, unless MAINTENANCE_MODE=false
 */
export function isMaintenanceMode(): boolean {
  if (process.env.NODE_ENV === "development") return false;
  if (process.env.MAINTENANCE_MODE === "false") return false;
  return true;
}

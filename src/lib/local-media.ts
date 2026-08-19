export const PUBLIC_IMAGES_PREFIX = "/images";

export const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "avif",
]);

export const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

export const ALLOWED_MEDIA_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
]);

export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export type MediaKind = "image" | "video";

export type MediaAsset = {
  name: string;
  folder: string;
  publicPath: string;
  size: number;
  mtime: number;
  kind: MediaKind;
};

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) return "";
  return filename.slice(dot + 1).toLowerCase();
}

export function mediaKindFor(filename: string): MediaKind | null {
  const ext = extensionOf(filename);
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return null;
}

export function isAllowedMediaFilename(filename: string): boolean {
  return mediaKindFor(filename) !== null;
}

/** Strip path segments and collapse a filename into a URL-safe asset name. */
export function sanitizeFilename(raw: string): string | null {
  const base = raw.replaceAll("\\", "/").split("/").pop()?.trim() ?? "";
  if (!base || base === "." || base === "..") return null;

  const ext = extensionOf(base);
  const stem = ext ? base.slice(0, -(ext.length + 1)) : base;
  const safeStem = stem
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (!safeStem || !ext || !ALLOWED_MEDIA_EXTENSIONS.has(ext)) return null;
  return `${safeStem}.${ext}`;
}

/**
 * Relative folder under `public/images`. Empty string is the images root.
 * Nested folders are allowed (`gallery/wdc-2026`).
 */
export function sanitizeFolder(raw: string): string | null {
  const trimmed = raw.trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "";
  if (trimmed.includes("..")) return null;

  const parts = trimmed.split("/").filter(Boolean);
  if (parts.length === 0 || parts.length > 4) return null;

  const safe = parts.map((part) =>
    part
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );

  if (safe.some((part) => !part)) return null;
  return safe.join("/");
}

export function isSafeExistingFilename(raw: string): boolean {
  if (!raw || raw.includes("/") || raw.includes("\\") || raw.includes("..")) {
    return false;
  }
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) return false;
  return isAllowedMediaFilename(raw);
}

export function publicMediaPath(folder: string, filename: string): string {
  return folder
    ? `${PUBLIC_IMAGES_PREFIX}/${folder}/${filename}`
    : `${PUBLIC_IMAGES_PREFIX}/${filename}`;
}

export function parsePublicMediaPath(publicPath: string): {
  folder: string;
  filename: string;
} | null {
  const prefix = `${PUBLIC_IMAGES_PREFIX}/`;
  if (!publicPath.startsWith(prefix)) return null;

  const rest = publicPath.slice(prefix.length);
  if (!rest || rest.includes("..") || rest.startsWith("/")) return null;

  const parts = rest.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const filename = parts.pop() ?? "";
  const folder = sanitizeFolder(parts.join("/"));
  if (folder === null || !isSafeExistingFilename(filename)) return null;
  return { folder, filename };
}

export function uniqueFilename(desired: string, taken: Set<string>): string {
  if (!taken.has(desired)) return desired;
  const ext = extensionOf(desired);
  const stem = desired.slice(0, -(ext.length + 1));
  let n = 2;
  let next = `${stem}-${n}.${ext}`;
  while (taken.has(next)) {
    n += 1;
    next = `${stem}-${n}.${ext}`;
  }
  return next;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

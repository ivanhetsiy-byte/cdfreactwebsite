import fs from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

import {
  MAX_MEDIA_BYTES,
  isSafeExistingFilename,
  mediaKindFor,
  parsePublicMediaPath,
  publicMediaPath,
  sanitizeFilename,
  sanitizeFolder,
  uniqueFilename,
  type MediaAsset,
} from "@/lib/local-media";

function imagesRoot(): string {
  return path.join(process.cwd(), "public", "images");
}

function assertDev() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Local media writes are development-only.");
  }
}

function isInsideImagesRoot(target: string): boolean {
  const root = path.resolve(imagesRoot());
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

/** Resolve a path under `public/images`, or null if it would escape. */
export function resolveImagesPath(
  folder: string,
  filename?: string,
  mode: "write" | "existing" = "write",
): string | null {
  const safeFolder = sanitizeFolder(folder);
  if (safeFolder === null) return null;

  let safeName: string | undefined;
  if (filename) {
    safeName =
      mode === "write" ? (sanitizeFilename(filename) ?? undefined) : filename;
    if (!safeName) return null;
    if (mode === "existing" && !isSafeExistingFilename(safeName)) return null;
  }

  const target = path.resolve(imagesRoot(), safeFolder, safeName ?? ".");
  if (!isInsideImagesRoot(target)) return null;
  return target;
}

const PRESET_FOLDERS = ["", "gallery", "herogallery", "staff"];

function walkMedia(
  dir: string,
  folder: string,
  files: MediaAsset[],
  folders: Set<string>,
): void {
  folders.add(folder);

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nextFolder = folder ? `${folder}/${entry.name}` : entry.name;
      const safeNext = sanitizeFolder(nextFolder);
      if (safeNext === null) continue;
      walkMedia(full, safeNext, files, folders);
      continue;
    }

    if (!entry.isFile()) continue;
    const kind = mediaKindFor(entry.name);
    if (!kind) continue;

    const stats = fs.statSync(full);
    files.push({
      name: entry.name,
      folder,
      publicPath: publicMediaPath(folder, entry.name),
      size: stats.size,
      mtime: stats.mtimeMs,
      kind,
    });
  }
}

export function listLocalMedia(): {
  folders: string[];
  files: MediaAsset[];
} {
  const root = imagesRoot();
  const files: MediaAsset[] = [];
  const folderSet = new Set<string>(PRESET_FOLDERS);
  if (fs.existsSync(root)) walkMedia(root, "", files, folderSet);

  files.sort((a, b) => b.mtime - a.mtime);
  const folders = [...folderSet].sort((a, b) => a.localeCompare(b));

  return { folders, files };
}

/** Public paths for photos in a `public/images` subfolder. */
export function loadFolderImages(
  folder: string,
  sort: "mtime" | "name" = "mtime",
): string[] {
  if (process.env.NODE_ENV === "development") noStore();

  const files = listLocalMedia().files.filter(
    (file) => file.folder === folder && file.kind === "image",
  );

  if (sort === "name") {
    files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }

  return files.map((file) => file.publicPath);
}

/** Photos in `public/images/gallery`, newest first. */
export function loadGalleryImages(): string[] {
  return loadFolderImages("gallery");
}

/** Photos in `public/images/herogallery`, numbered name order. */
export function loadHeroGalleryImages(): string[] {
  return loadFolderImages("herogallery", "name");
}

export async function writeLocalMediaFile(input: {
  folder: string;
  originalName: string;
  bytes: Uint8Array;
  overwrite: boolean;
}): Promise<MediaAsset> {
  assertDev();

  if (input.bytes.byteLength === 0) {
    throw new Error("File is empty.");
  }
  if (input.bytes.byteLength > MAX_MEDIA_BYTES) {
    throw new Error("File is larger than 50 MB.");
  }

  const folder = sanitizeFolder(input.folder);
  const desired = sanitizeFilename(input.originalName);
  if (folder === null || !desired) {
    throw new Error("Unsupported file or folder name.");
  }
  if (!mediaKindFor(desired)) {
    throw new Error("Use jpg, png, webp, gif, svg, avif, mp4, webm, or mov.");
  }

  const dir = resolveImagesPath(folder);
  if (!dir) throw new Error("Invalid destination folder.");
  fs.mkdirSync(dir, { recursive: true });

  const taken = new Set(
    fs
      .readdirSync(dir)
      .filter((name) => {
        try {
          return fs.statSync(path.join(dir, name)).isFile();
        } catch {
          return false;
        }
      })
      .map((name) => name.toLowerCase()),
  );

  const filename = input.overwrite
    ? desired
    : uniqueFilename(desired, taken);
  const dest = resolveImagesPath(folder, filename);
  if (!dest) throw new Error("Invalid filename.");

  fs.writeFileSync(dest, input.bytes);

  const stats = fs.statSync(dest);
  return {
    name: filename,
    folder,
    publicPath: publicMediaPath(folder, filename),
    size: stats.size,
    mtime: stats.mtimeMs,
    kind: mediaKindFor(filename) ?? "image",
  };
}

export function deleteLocalMediaFile(publicPath: string): void {
  assertDev();

  const parsed = parsePublicMediaPath(publicPath);
  if (!parsed) throw new Error("Invalid media path.");

  const dest = resolveImagesPath(parsed.folder, parsed.filename, "existing");
  if (!dest) throw new Error("Invalid media path.");
  if (!fs.existsSync(dest) || !fs.statSync(dest).isFile()) {
    throw new Error("File not found.");
  }

  fs.unlinkSync(dest);
}

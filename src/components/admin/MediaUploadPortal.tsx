"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { formatBytes, type MediaAsset } from "@/lib/local-media";

const fieldClass =
  "w-full rounded-none border border-white/20 bg-black px-3 py-2 font-swiss text-sm text-white outline-none focus:border-white/60";
const labelClass = "mb-1 block font-swiss text-xs tracking-wide text-white/50";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.mp4,.webm,.mov";

type Listing = {
  folders: string[];
  files: MediaAsset[];
};

function folderLabel(folder: string) {
  return folder ? folder : "images (root)";
}

export function MediaUploadPortal({ initial }: { initial: Listing }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(initial.files);
  const [folders, setFolders] = useState(initial.folders);
  const [folder, setFolder] = useState(
    initial.folders.includes("gallery") ? "gallery" : "",
  );
  const [customFolder, setCustomFolder] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [filter, setFilter] = useState("all");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const destination = customFolder.trim() ? customFolder.trim() : folder;

  const visible = useMemo(() => {
    if (filter === "all") return files;
    return files.filter((file) => file.folder === filter);
  }, [files, filter]);

  const applyListing = (listing: Listing) => {
    setFiles(listing.files);
    setFolders(listing.folders);
  };

  const uploadFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;

      startTransition(async () => {
        setError(null);
        const form = new FormData();
        form.set("folder", destination);
        form.set("overwrite", overwrite ? "true" : "false");
        for (const file of incoming) form.append("files", file);

        try {
          const res = await fetch("/api/admin/media", {
            method: "POST",
            body: form,
          });
          const data = (await res.json()) as Listing & {
            uploaded?: MediaAsset[];
            error?: string;
          };
          if (!res.ok) {
            setError(data.error ?? "Upload failed");
            return;
          }
          applyListing(data);
          const names = (data.uploaded ?? [])
            .map((asset) => asset.publicPath)
            .join(", ");
          setStatus(
            data.uploaded?.length === 1
              ? `Saved ${names}`
              : `Saved ${data.uploaded?.length ?? incoming.length} files`,
          );
        } catch {
          setError("Network error while uploading.");
        }
      });
    },
    [destination, overwrite],
  );

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const pasted = [...(event.clipboardData?.files ?? [])];
      if (pasted.length === 0) return;
      event.preventDefault();
      uploadFiles(pasted);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [uploadFiles]);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = [...(event.target.files ?? [])];
    event.target.value = "";
    uploadFiles(selected);
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    uploadFiles([...event.dataTransfer.files]);
  };

  const removeFile = (asset: MediaAsset) => {
    const ok = window.confirm(`Delete ${asset.publicPath} from disk?`);
    if (!ok) return;

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/media", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicPath: asset.publicPath }),
        });
        const data = (await res.json()) as Listing & { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Delete failed");
          return;
        }
        applyListing(data);
        setStatus(`Deleted ${asset.publicPath}`);
      } catch {
        setError("Network error while deleting.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10 md:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-white/15 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-swiss text-xs tracking-[0.2em] text-white/40 uppercase">
              Local development only
            </p>
            <h1 className="mt-2 font-swiss text-3xl font-bold tracking-tight md:text-4xl">
              Media
            </h1>
            <p className="mt-2 max-w-xl font-swiss text-sm text-white/55">
              Drop photos or video into{" "}
              <code className="text-white/80">public/images</code>. Copy the
              path and paste it into a component. 404s in production.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="border border-white/30 px-4 py-2 font-swiss text-sm hover:bg-white hover:text-black"
            >
              Store admin
            </Link>
            <Link
              href="/"
              className="border border-white/30 px-4 py-2 font-swiss text-sm hover:bg-white hover:text-black"
            >
              Open site
            </Link>
          </div>
        </header>

        {(status || error) && (
          <p
            className={`font-swiss text-sm ${error ? "text-red-400" : "text-white/70"}`}
            role="status"
          >
            {error ?? status}
          </p>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid gap-4 self-start">
            <div>
              <label className={labelClass} htmlFor="media-folder">
                Destination folder
              </label>
              <select
                id="media-folder"
                className={fieldClass}
                value={folder}
                onChange={(event) => {
                  setFolder(event.target.value);
                  if (event.target.value) setCustomFolder("");
                }}
              >
                {folders.map((entry) => (
                  <option key={entry || "root"} value={entry}>
                    {folderLabel(entry)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="media-custom-folder">
                Or new folder
              </label>
              <input
                id="media-custom-folder"
                className={fieldClass}
                value={customFolder}
                onChange={(event) => setCustomFolder(event.target.value)}
                placeholder="staff, gallery/wdc-2026"
              />
            </div>
            <label className="flex items-center gap-2 font-swiss text-sm text-white/70">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(event) => setOverwrite(event.target.checked)}
              />
              Replace file if the name already exists
            </label>
            <p className="font-swiss text-xs text-white/40">
              Saving to{" "}
              <code className="text-white/70">
                /images{destination ? `/${destination}` : ""}
              </code>
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              disabled={pending}
              className={[
                "flex min-h-56 w-full flex-col items-center justify-center border border-dashed px-6 py-10 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
                dragging
                  ? "border-white bg-white/10"
                  : "border-white/25 hover:border-white/60",
                pending ? "opacity-50" : "",
              ].join(" ")}
            >
              <span className="font-swiss text-lg font-medium">
                {pending ? "Saving…" : "Drop media here"}
              </span>
              <span className="mt-2 max-w-sm font-swiss text-sm text-white/50">
                Click to browse, or paste from the clipboard. jpg, png, webp,
                gif, svg, avif, mp4, webm, mov. Max 50 MB.
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={onInputChange}
            />
          </div>
        </section>

        <section aria-labelledby="library-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="library-heading" className="font-swiss text-lg font-medium">
              Library ({visible.length})
            </h2>
            <div className="sm:w-56">
              <label className={labelClass} htmlFor="media-filter">
                Show
              </label>
              <select
                id="media-filter"
                className={fieldClass}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">All folders</option>
                {folders.map((entry) => (
                  <option key={`filter-${entry || "root"}`} value={entry}>
                    {folderLabel(entry)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="border border-dashed border-white/20 px-4 py-10 text-center font-swiss text-sm text-white/45">
              Nothing in this folder yet. Drop a file to add one.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((asset) => (
                <li
                  key={asset.publicPath}
                  className="flex flex-col border border-white/15"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                    {asset.kind === "video" ? (
                      <video
                        src={asset.publicPath}
                        className="size-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.publicPath}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-swiss text-sm">{asset.name}</p>
                      <p className="mt-1 truncate font-swiss text-xs text-white/45">
                        {asset.publicPath} · {formatBytes(asset.size)}
                      </p>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(asset.publicPath);
                          setStatus(`Copied ${asset.publicPath}`);
                          setError(null);
                        }}
                        className="border border-white/25 px-3 py-1.5 font-swiss text-xs hover:border-white"
                      >
                        Copy path
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(asset)}
                        disabled={pending}
                        className="ml-auto border border-white/25 px-3 py-1.5 font-swiss text-xs text-red-300 hover:border-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

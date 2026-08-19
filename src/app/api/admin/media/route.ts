import { NextResponse } from "next/server";

import {
  deleteLocalMediaFile,
  listLocalMedia,
  writeLocalMediaFile,
} from "@/lib/local-media.server";
import { MAX_MEDIA_BYTES } from "@/lib/local-media";

function denyUnlessDev() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function GET() {
  const denied = denyUnlessDev();
  if (denied) return denied;

  return NextResponse.json(listLocalMedia());
}

export async function POST(request: Request) {
  const denied = denyUnlessDev();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const folderRaw = form.get("folder");
  const folder = typeof folderRaw === "string" ? folderRaw : "";
  const overwrite = form.get("overwrite") === "true";
  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Choose at least one file" }, { status: 400 });
  }

  const uploaded = [];
  for (const file of files) {
    if (file.size > MAX_MEDIA_BYTES) {
      return NextResponse.json(
        { error: `${file.name} is larger than 50 MB` },
        { status: 400 },
      );
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      uploaded.push(
        await writeLocalMediaFile({
          folder,
          originalName: file.name,
          bytes,
          overwrite,
        }),
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : `Failed to save ${file.name}`,
        },
        { status: 400 },
      );
    }
  }

  const listing = listLocalMedia();
  return NextResponse.json({
    uploaded,
    files: listing.files,
    folders: listing.folders,
  });
}

export async function DELETE(request: Request) {
  const denied = denyUnlessDev();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const publicPath =
    body && typeof body === "object" && "publicPath" in body
      ? (body as { publicPath: unknown }).publicPath
      : null;

  if (typeof publicPath !== "string") {
    return NextResponse.json(
      { error: "Expected { publicPath: string }" },
      { status: 400 },
    );
  }

  try {
    deleteLocalMediaFile(publicPath);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete file",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(listLocalMedia());
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MediaUploadPortal } from "@/components/admin/MediaUploadPortal";
import { listLocalMedia } from "@/lib/local-media.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media (local)",
  robots: { index: false, follow: false },
};

export default function MediaAdminRoute() {
  if (process.env.NODE_ENV === "production") notFound();

  return <MediaUploadPortal initial={listLocalMedia()} />;
}

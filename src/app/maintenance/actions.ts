"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getPreviewSecret,
  PREVIEW_COOKIE,
  PREVIEW_COOKIE_MAX_AGE,
  previewCookieValue,
  secretsMatch,
} from "@/lib/maintenance";

export type UnlockState = { error: string } | null;

export async function unlockPreview(
  _prev: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const submitted = String(formData.get("code") ?? "");
  const secret = getPreviewSecret();

  if (!secret || !secretsMatch(submitted, secret)) {
    return { error: "That code doesn't work." };
  }

  const token = await previewCookieValue(secret);
  const jar = await cookies();
  jar.set(PREVIEW_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PREVIEW_COOKIE_MAX_AGE,
  });

  redirect("/");
}

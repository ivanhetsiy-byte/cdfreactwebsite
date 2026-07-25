import { NextResponse } from "next/server";

import { isLastNameOnRoster } from "@/lib/checkout-roster";

type VerifyBody = {
  lastName?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lastName = asTrimmedString(body.lastName);
  if (!lastName) {
    return NextResponse.json(
      { ok: false, error: "Last name is required." },
      { status: 400 },
    );
  }

  if (!isLastNameOnRoster(lastName)) {
    return NextResponse.json({ ok: false, error: "Last name not found." });
  }

  return NextResponse.json({ ok: true });
}

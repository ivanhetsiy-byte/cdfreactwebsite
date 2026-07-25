import { Resend } from "resend";
import { NextResponse } from "next/server";

import { formatMoney, MAX_BAG_QUANTITY, parsePrice } from "@/lib/bag";
import { isLastNameOnRoster } from "@/lib/checkout-roster";
import { getStoreProduct } from "@/lib/store-products";

type OrderItemBody = {
  productId?: unknown;
  title?: unknown;
  price?: unknown;
  size?: unknown;
  quantity?: unknown;
};

type OrderBody = {
  lastName?: unknown;
  items?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ValidLine = {
  productId: string;
  title: string;
  price: string;
  size: string;
  quantity: number;
  lineTotal: number;
};

function validateItems(raw: unknown): ValidLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const lines: ValidLine[] = [];

  for (const entry of raw as OrderItemBody[]) {
    const productId = asTrimmedString(entry.productId);
    const size = asTrimmedString(entry.size);
    const quantity =
      typeof entry.quantity === "number"
        ? entry.quantity
        : Number(entry.quantity);

    if (!productId || !size || !Number.isFinite(quantity)) return null;
    if (quantity < 1 || quantity > MAX_BAG_QUANTITY) return null;

    const product = getStoreProduct(productId);
    if (!product) return null;
    if (!product.sizes.some((s) => s === size)) return null;

    const unit = parsePrice(product.price);
    lines.push({
      productId,
      title: product.title,
      price: product.price,
      size,
      quantity: Math.floor(quantity),
      lineTotal: unit * Math.floor(quantity),
    });
  }

  return lines;
}

function buildOrderEmailHtml(fields: {
  lastName: string;
  lines: ValidLine[];
  subtotal: number;
}): string {
  const lastName = escapeHtml(fields.lastName);
  const rows = fields.lines
    .map((line) => {
      const title = escapeHtml(line.title);
      const size = escapeHtml(line.size);
      const qty = String(line.quantity);
      const total = escapeHtml(formatMoney(line.lineTotal));
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:15px;color:#000000;">
          <strong>${title}</strong><br />
          <span style="color:#666666;font-size:13px;">Size ${size} · Qty ${qty}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:15px;color:#000000;text-align:right;white-space:nowrap;">
          ${total}
        </td>
      </tr>`;
    })
    .join("");

  const subtotal = escapeHtml(formatMoney(fields.subtotal));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Store order — ${lastName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;">
          <tr>
            <td style="background-color:#000000;padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#999999;font-weight:500;">
                CDF · Store Order
              </p>
              <h1 style="margin:0;font-size:28px;line-height:1;letter-spacing:-0.04em;text-transform:uppercase;color:#ffffff;font-weight:700;">
                New Order
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#666666;font-weight:500;">
                Last name verified
              </p>
              <p style="margin:0 0 24px;font-size:20px;line-height:1.3;color:#000000;font-weight:700;">
                ${lastName}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${rows}
                <tr>
                  <td style="padding:16px 0 0;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;color:#666666;font-weight:500;">
                    Subtotal
                  </td>
                  <td style="padding:16px 0 0;font-size:18px;color:#000000;font-weight:700;text-align:right;">
                    ${subtotal}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;border-top:3px solid #000000;">
              <p style="margin:0;font-size:12px;line-height:1.4;color:#999999;">
                Child Dance Factory · cdf.studio · Pay in person at the studio
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return NextResponse.json(
      { error: "Checkout is not configured." },
      { status: 500 },
    );
  }

  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lastName = asTrimmedString(body.lastName);
  if (!lastName) {
    return NextResponse.json(
      { error: "Last name is required." },
      { status: 400 },
    );
  }

  if (!isLastNameOnRoster(lastName)) {
    return NextResponse.json(
      { error: "Last name not found." },
      { status: 403 },
    );
  }

  const lines = validateItems(body.items);
  if (!lines) {
    return NextResponse.json(
      { error: "Bag contents are invalid." },
      { status: 400 },
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  const textBody = [
    `Last name: ${lastName}`,
    "",
    "Items:",
    ...lines.map(
      (line) =>
        `- ${line.title} (${line.size}) × ${line.quantity} — ${formatMoney(line.lineTotal)}`,
    ),
    "",
    `Subtotal: ${formatMoney(subtotal)}`,
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Store order: ${lastName}`,
    text: textBody,
    html: buildOrderEmailHtml({ lastName, lines, subtotal }),
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to submit order. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, subtotal });
}

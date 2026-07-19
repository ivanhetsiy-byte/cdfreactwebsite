import { Resend } from "resend";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildContactEmailHtml(fields: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): string {
  const name = escapeHtml(fields.name);
  const email = escapeHtml(fields.email);
  const phone = escapeHtml(fields.phone);
  const phoneTel = phoneDigits(fields.phone);
  const message = escapeHtml(fields.message).replace(/\n/g, "<br />");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New contact from ${name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;">
          <tr>
            <td style="background-color:#000000;padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#999999;font-weight:500;">
                CDF · Contact Form
              </p>
              <h1 style="margin:0;font-size:28px;line-height:1;letter-spacing:-0.04em;text-transform:uppercase;color:#ffffff;font-weight:700;">
                New Message
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#6b6b6b;">
                Someone reached out through the website contact form.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e5e5;">
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#666666;font-weight:500;">Name</p>
                    <p style="margin:0;font-size:17px;line-height:1.4;color:#000000;font-weight:700;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#666666;font-weight:500;">Email</p>
                    <p style="margin:0;font-size:17px;line-height:1.4;">
                      <a href="mailto:${email}" style="color:#000000;font-weight:700;text-decoration:underline;">${email}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#666666;font-weight:500;">Phone</p>
                    <p style="margin:0;font-size:17px;line-height:1.4;">
                      <a href="tel:${phoneTel}" style="color:#000000;font-weight:700;text-decoration:underline;">${phone}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#666666;font-weight:500;">Message</p>
                    <p style="margin:0;font-size:16px;line-height:1.55;color:#333333;">${message}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                <tr>
                  <td style="background-color:#000000;">
                    <a href="mailto:${email}" style="display:inline-block;padding:14px 24px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ffffff;font-weight:700;text-decoration:none;">
                      Reply to ${name} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;border-top:3px solid #000000;">
              <p style="margin:0;font-size:12px;line-height:1.4;color:#999999;">
                Child Dance Factory · cdf.studio
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
      { error: "Contact form is not configured." },
      { status: 500 },
    );
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const phone = asTrimmedString(body.phone);
  const message = asTrimmedString(body.message);
  const digits = phoneDigits(phone);

  if (!name || !email || !phone || !message) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (digits.length !== 10) {
    return NextResponse.json(
      { error: "Please enter a 10-digit US phone number." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);

  const textBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `New contact: ${name}`,
    text: textBody,
    html: buildContactEmailHtml({ name, email, phone, message }),
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

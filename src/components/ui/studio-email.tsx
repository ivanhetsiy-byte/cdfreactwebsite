import { STUDIO_EMAIL } from "@/lib/site-links";

/** Canonical studio inbox — keep in sync with contact/footer mailto targets. */
export { STUDIO_EMAIL };

const AT = STUDIO_EMAIL.indexOf("@");
const LOCAL = STUDIO_EMAIL.slice(0, AT);
const DOMAIN = STUDIO_EMAIL.slice(AT + 1);

/**
 * Renders the studio email with an optical nudge on `@`.
 * Helvetica’s `@` sits near cap-height while the local part ends in a
 * descender (`y`), which reads as a mid-string baseline step at display sizes.
 */
export function StudioEmailText() {
  return (
    <>
      {LOCAL}
      <span className="type-email-at">@</span>
      {DOMAIN}
    </>
  );
}

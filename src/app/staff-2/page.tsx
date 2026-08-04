import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Staff 2 (temp)",
  robots: { index: false, follow: false },
};

/** Light staff landed on production `/staff` — keep this route as an alias. */
export default function Page() {
  redirect("/staff");
}

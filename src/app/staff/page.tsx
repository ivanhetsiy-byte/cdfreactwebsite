import type { Metadata } from "next";

import { LmlStudioPage } from "@/components/lab/lml-studio/LmlStudioPage";

export const metadata: Metadata = {
  title: "Staff",
};

/** Production staff route — lab studio; global Navbar owns Contact / Menu. */
export default function Page() {
  return <LmlStudioPage chrome="site" />;
}

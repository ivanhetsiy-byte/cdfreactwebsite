import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "Ballet, jazz, gymnastics, and acrobatics classes at Childrens Dance Factory.",
};

const ClassesWireframes = dynamic(
  () =>
    import("@/components/sections/classes-page").then(
      (m) => m.ClassesWireframes,
    ),
  {
    loading: () => (
      <div className="min-h-[50vh]" aria-busy aria-label="Loading classes" />
    ),
  },
);

export default function Page() {
  return (
    <PageShell>
      <ClassesWireframes />
    </PageShell>
  );
}

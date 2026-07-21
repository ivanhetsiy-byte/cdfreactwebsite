import type { Metadata } from "next";

import { ClassesWireframes } from "@/components/sections/classes-wireframes";

export const metadata: Metadata = {
  title: "Classes",
};

export default function Page() {
  return (
    <main
      id="main-content"
      className="relative w-full min-h-screen bg-white text-black dark:bg-black dark:text-white pt-32 pb-24 px-6 md:p-10 md:pt-44 select-none swiss-no-select"
    >
      <ClassesWireframes />
    </main>
  );
}

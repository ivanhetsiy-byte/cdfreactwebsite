"use client";

import dynamic from "next/dynamic";

export const Beams = dynamic(
  () => import("@/components/backgrounds/Beams").then((m) => m.Beams),
  { ssr: false },
);

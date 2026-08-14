"use client";

import Image from "next/image";

const PORTRAIT_SRC = "/images/staff/mykhaylo.jpg";

type PortraitCanvasProps = {
  /** Soft well option instead of a black crop box. */
  theme?: "dark" | "light";
};

export function PortraitCanvas({ theme = "dark" }: PortraitCanvasProps) {
  return (
    <div
      className={`pointer-events-auto relative z-[5] aspect-square w-full max-w-full overflow-hidden select-none ${
        theme === "light" ? "bg-neutral-100" : "bg-black"
      }`}
    >
      <Image
        src={PORTRAIT_SRC}
        alt="Mykhaylo Hetsiy"
        fill
        priority
        draggable={false}
        sizes="(max-width: 768px) 100vw, 40vw"
        className="object-cover object-center select-none swiss-no-select"
      />
    </div>
  );
}

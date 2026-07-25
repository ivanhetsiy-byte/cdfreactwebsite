"use client";

import Image from "next/image";

/** Temporary portrait stand-in until final art is locked. */
const PORTRAIT_SRC = "/images/staff/owner.png";

export function PortraitCanvas() {
  return (
    <div className="pointer-events-auto relative z-[5] aspect-square w-full max-w-full overflow-hidden bg-black select-none">
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

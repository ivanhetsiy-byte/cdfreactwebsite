import Link from "next/link";

import type { Competition } from "@/lib/competitions";
import { aboutWhereHref } from "@/lib/competitions";

type CompetitionWireframeProps = {
  competition: Competition;
};

/** Placeholder competition detail — photos / achievements to come. */
export function CompetitionWireframe({ competition }: CompetitionWireframeProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 md:px-10 md:py-24">
      <Link
        href={aboutWhereHref()}
        className="font-swiss w-fit text-sm tracking-wide text-white/60 transition-colors hover:text-white"
      >
        ← About
      </Link>

      <header className="flex flex-col gap-3">
        <p className="type-eyebrow text-xs text-white/50">
          Competition
        </p>
        <h1 className="font-swiss text-[clamp(2.5rem,8vw,5.5rem)] leading-none tracking-tight text-white">
          {competition.name}
        </h1>
        <p className="font-swiss text-[clamp(1.25rem,3vw,2rem)] tracking-tight text-white/70">
          {competition.achievement}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-white/25 bg-white/[0.03]">
          <span className="font-swiss text-sm tracking-wide text-white/40">
            Photo gallery — coming soon
          </span>
        </div>
        <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-white/25 bg-white/[0.03]">
          <span className="font-swiss text-sm tracking-wide text-white/40">
            Achievements — coming soon
          </span>
        </div>
      </div>
    </div>
  );
}

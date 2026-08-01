import type { Metadata } from "next";
import Link from "next/link";

import { LightRays } from "@/components/backgrounds/LightRays";

const INSTAGRAM =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
  "https://www.instagram.com/childancefactory";

export const metadata: Metadata = {
  title: "Under Maintenance",
  description:
    "Childrens Dance Factory is temporarily under maintenance. Check back soon.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-[calc(100dvh-11rem)] w-full flex-col overflow-hidden bg-black text-white md:min-h-[calc(100dvh-13rem)]">
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="bottom-center"
          raysColor="#ffffff"
          raysSpeed={0.55}
          lightSpread={0.9}
          fadeDistance={0.85}
          saturation={1.35}
          followMouse={false}
        />
      </div>

      <main
        id="main-content"
        className="relative z-10 flex flex-1 flex-col justify-center px-6 py-16 md:px-10"
      >
        <p className="font-swiss text-xs font-medium tracking-[0.28em] text-white/45 uppercase">
          Philadelphia
        </p>
        <h1 className="mt-5 max-w-[12ch] font-swiss text-[clamp(2.75rem,11vw,7.5rem)] font-bold leading-[0.88] tracking-tighter">
          Under maintenance
        </h1>
        <p className="mt-6 max-w-md font-swiss text-base leading-relaxed text-white/65 md:text-lg">
          We&apos;re polishing the new Childrens Dance Factory site. The studio
          is open as usual — this page will be back shortly.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="mailto:childancefactory@gmail.com"
            className="font-swiss inline-flex h-12 items-center justify-center border-2 border-white bg-white px-6 text-sm font-bold tracking-tight text-black transition-colors duration-300 hover:bg-black hover:text-white"
          >
            Email the studio
          </a>
          <Link
            href={INSTAGRAM}
            className="font-swiss text-sm tracking-wide text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Instagram
          </Link>
        </div>
      </main>
    </div>
  );
}

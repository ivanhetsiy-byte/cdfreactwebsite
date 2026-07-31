import type { Metadata } from "next";

import { Logo } from "@/components/layout/Logo";
import { MaintenanceView } from "@/components/maintenance/MaintenanceView";

export const metadata: Metadata = {
  title: "Under Maintenance",
  description:
    "Childance Factory is temporarily under maintenance. We'll be back soon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-svh flex-col overflow-hidden bg-[#0c0c0c] text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(195, 23, 22, 0.28), transparent 55%), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(255, 255, 255, 0.04), transparent 50%), linear-gradient(180deg, #121212 0%, #0a0a0a 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <header className="flex items-center">
          <Logo forceWhite className="h-[52px] md:h-[64px]" />
        </header>

        <MaintenanceView />
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";

const OWNER_PHOTO = "/images/staff/owner.png";
/** Figma accent — Contact pill */
const CONTACT_RED = "#c31716";

function formatEstTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Full-viewport staff Studio hero (Figma 58:6).
 * First paint = one svh; bottom status bar sits at the viewport end.
 * Site navbar stays; Figma Menu is not implemented yet.
 */
export function StaffWireframes() {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const [clock, setClock] = useState(() => formatEstTime(new Date()));

  useEffect(() => {
    const tick = () => setClock(formatEstTime(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) return;
    if (navLockRef.current) return;

    navLockRef.current = true;

    if (targetPath === "/") {
      sessionStorage.setItem("fromSubpage", "true");
    }

    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, ROUTE_COVER_MS);
  };

  return (
    <section
      aria-labelledby="staff-hero-heading"
      className="film-grain relative flex h-svh min-h-svh w-full flex-col overflow-hidden bg-black text-white"
    >
      {/* Main: type left / portrait right — portrait top = 110px on desktop */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pt-[6.5rem] pb-24 md:flex-row md:items-start md:justify-between md:gap-8 md:px-8 md:pt-[110px] md:pb-28 lg:px-10">
        <div className="flex w-full shrink-0 flex-col md:w-[min(52%,52rem)]">
          <h1
            id="staff-hero-heading"
            className="font-swiss text-[clamp(3.75rem,18vw,18.9rem)] font-normal leading-[0.995] tracking-[0.01em] text-white"
          >
            Studio
          </h1>
          <p className="mt-1 font-swiss text-[clamp(1.25rem,3.6vw,3.625rem)] font-normal leading-normal tracking-[-0.01em] text-white md:mt-2">
            (Found In 2014)
          </p>
        </div>

        {/* Portrait — Figma ~965×1004 (~0.96 ratio), right column */}
        <div className="relative mt-8 aspect-[965/1004] w-full max-w-[18rem] self-end overflow-hidden sm:max-w-[22rem] md:mt-0 md:w-[min(38vw,60.3rem)] md:max-w-none md:self-start">
          <Image
            src={OWNER_PHOTO}
            alt="Studio portrait"
            fill
            priority
            sizes="(max-width: 768px) 72vw, 38vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Status bar — pinned to viewport bottom, slightly lowered inset */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 px-5 pb-3 pt-2 md:gap-6 md:px-8 md:pb-4 lg:px-10">
        <p className="font-swiss text-[11px] font-normal tracking-[-0.01em] text-[#fcfcfc] md:text-[18px]">
          © CDF, LLC
        </p>

        <p
          className="hidden font-swiss text-[11px] font-normal tracking-[-0.01em] text-[#fcfcfc] sm:block md:text-[18px]"
          aria-live="off"
        >
          EST <span className="mx-1.5">•</span> {clock}
        </p>

        <p
          className="hidden font-swiss text-[11px] font-normal tracking-[-0.01em] md:block md:text-[18px]"
          aria-hidden="true"
        >
          <span className="text-[#7f7e7f]">UKR</span>
          <span className="text-[#fcfcfc]">{"  EN"}</span>
        </p>

        <Link
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            handleDelayedNavigation("/contact");
          }}
          className="inline-flex h-[44px] min-w-[7.5rem] items-center justify-center rounded-full px-6 font-swiss text-[16px] font-normal tracking-[0.01em] text-white transition-opacity duration-150 hover:opacity-90 md:h-[55px] md:min-w-[10.8rem] md:text-[21px]"
          style={{ backgroundColor: CONTACT_RED }}
        >
          Contact
        </Link>
      </div>
    </section>
  );
}

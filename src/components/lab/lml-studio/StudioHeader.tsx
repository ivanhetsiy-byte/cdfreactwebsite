"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { Logo } from "@/components/layout/Logo";
import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";
import { requestOpenSiteMenu } from "@/lib/site-menu";

/**
 * Same outer footprint as lab LML mark.
 * Inner CDF art is cropped/scaled so ink fills that box (no extra downward growth).
 */
const LOGO_HEIGHT_CLASS =
  "h-[calc(min(25vw,220px)*179/467)] md:h-[calc(min(15vw,180px)*179/467)]";

const LOGO_IMG_CLASS = "!h-[calc(100%*77/55)] !w-auto !max-h-none !items-start";

const linkBase =
  "relative top-[-8px] inline-block text-[3.2rem] leading-none text-white transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-current after:transition-all after:content-['']";

type StudioHeaderProps = {
  /** `lab` = LML + Work/Studio; `staff` = CDF + Contact/Menu */
  variant?: "lab" | "staff";
};

export function StudioHeader({ variant = "lab" }: StudioHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const isStaff = variant === "staff";

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) return;
    if (navLockRef.current) return;

    navLockRef.current = true;

    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, ROUTE_COVER_MS);
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-[1001] mix-blend-difference">
      <div className="relative z-20 w-full px-5 py-4 md:px-6.5 md:py-6.5">
        <div className="flex h-16 w-full items-center justify-between md:items-start">
          {isStaff ? (
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleDelayedNavigation("/");
              }}
              className={`swiss-no-select relative z-10 flex w-auto min-h-0 shrink-0 items-start overflow-hidden text-white ${LOGO_HEIGHT_CLASS}`}
              aria-label="CDF home"
            >
              <Logo className={LOGO_IMG_CLASS} blend />
            </Link>
          ) : (
            <Link href="/staff" className="text-white" aria-label="LML">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 467 179"
                fill="currentColor"
                className="w-[25vw] max-w-[220px] md:w-[15vw] md:max-w-[180px]"
              >
                <path d="M347.168 0H376.918V153.5H466.168V178.75H347.168V0Z" />
                <path d="M139.404 178.75V0H177.904L227.904 137.5H228.404L278.154 0H316.654V178.75H287.654V43.25H287.154L239.904 178.75H216.154L168.904 43.25H168.404V178.75H139.404Z" />
                <path d="M0 0H29.75V153.5H119V178.75H0V0Z" />
              </svg>
            </Link>
          )}

          {isStaff ? (
            <>
              <nav className="hidden items-center justify-between font-medium md:flex md:w-[40%]">
                <Link
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelayedNavigation("/contact");
                  }}
                  className={`${linkBase} after:w-0 hover:after:w-full`}
                >
                  Contact
                </Link>
                <button
                  type="button"
                  onClick={() => requestOpenSiteMenu()}
                  className={`${linkBase} cursor-pointer after:w-0 hover:after:w-full`}
                  aria-label="Open menu"
                  aria-controls="site-nav-menu"
                >
                  Menu
                </button>
              </nav>
              <button
                type="button"
                onClick={() => requestOpenSiteMenu()}
                className="relative z-10 text-xl font-medium leading-none text-white transition-opacity hover:opacity-70 md:hidden"
                aria-label="Open menu"
                aria-controls="site-nav-menu"
              >
                Menu
              </button>
            </>
          ) : (
            <nav className="hidden items-center justify-between font-medium md:flex md:w-[40%]">
              <a
                href="#work"
                className={`${linkBase} after:w-0 hover:after:w-full`}
              >
                Work
              </a>
              <a
                href="#main-content"
                className={`${linkBase} after:w-full`}
              >
                Studio
              </a>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

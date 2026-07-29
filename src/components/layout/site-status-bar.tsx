"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useBag } from "@/context/BagContext";
import { useLanguage, type Language } from "@/context/LanguageContext";
import { requestRouteCover, ROUTE_COVER_MS } from "@/lib/route-cover";
import { SITE_MENU_STATE_EVENT } from "@/lib/site-menu";

const LANG_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "uk", label: "UK" },
  { code: "ru", label: "RU" },
  { code: "ja", label: "JA" },
];

const BAG_RED = "var(--brand-red)";

function formatEstTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M4.75 8.75h14.5l-1.05 11.55A1.9 1.9 0 0 1 16.32 22H7.68a1.9 1.9 0 0 1-1.88-1.7L4.75 8.75Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M9.1 8.75V7.15a2.9 2.9 0 0 1 5.8 0v1.6"
      />
    </svg>
  );
}

const BAG_ICON_CLASS =
  "h-[3.78rem] w-[3.78rem] md:h-[4.32rem] md:w-[4.32rem]";
const BAG_SLOT_CLASS = "relative size-[5rem] shrink-0 md:size-[5.7rem]";
const CHROME_PAD =
  "w-full px-5 py-3 md:px-8 md:py-3.5 lg:px-10";

function isStorePath(pathname: string) {
  return pathname === "/store" || pathname.startsWith("/store/");
}

/**
 * Site-wide fixed meta strip.
 *
 * Contrast flip must live on the fixed blended layer itself (same as navbar).
 * Bag icon only appears on store routes; red hover + badge sit in a separate
 * non-blended overlay so brand red stays true.
 */
export function SiteStatusBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { count } = useBag();
  const [time, setTime] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagHovered, setBagHovered] = useState(false);
  const navLockRef = useRef(false);

  const showBag = isStorePath(pathname);

  useEffect(() => {
    const tick = () => setTime(formatEstTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onMenuState = (e: Event) => {
      const open = Boolean((e as CustomEvent<{ open?: boolean }>).detail?.open);
      setMenuOpen(open);
    };
    window.addEventListener(SITE_MENU_STATE_EVENT, onMenuState);
    return () => window.removeEventListener(SITE_MENU_STATE_EVENT, onMenuState);
  }, []);

  useEffect(() => {
    if (!showBag) setBagHovered(false);
  }, [showBag]);

  const goBag = () => {
    if (pathname === "/bag" || navLockRef.current) return;
    navLockRef.current = true;
    requestRouteCover();
    window.setTimeout(() => {
      router.push("/bag");
      navLockRef.current = false;
    }, ROUTE_COVER_MS);
  };

  const badgeLabel = count > 99 ? "99+" : String(count);
  const showBadge = showBag && count > 0 && !bagHovered;

  return (
    <>
      {/* Blended chrome — difference on this fixed layer, like the navbar */}
      <div
        role="contentinfo"
        aria-label="Site status"
        aria-hidden={menuOpen}
        data-site-status-bar
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[10050] mix-blend-difference font-swiss text-white transition-opacity duration-300"
      >
        <div className={`pointer-events-auto ${CHROME_PAD}`}>
          <div className="flex w-full items-center justify-between gap-3 text-[0.7rem] md:text-[0.95rem]">
            {showBag ? (
              <div className={BAG_SLOT_CLASS}>
                {!bagHovered ? (
                  <div
                    className="flex size-full items-center justify-center rounded-full bg-white/15"
                    aria-hidden
                  >
                    <BagIcon className={BAG_ICON_CLASS} />
                  </div>
                ) : (
                  <div className="size-full" aria-hidden />
                )}
              </div>
            ) : (
              <p className="pointer-events-none shrink-0 tracking-tight text-white/80">
                © CDF, LLC
                <span className="ml-2 hidden text-white/40 sm:inline">
                  Est. for the stage
                </span>
              </p>
            )}

            <p
              className="pointer-events-none hidden items-center tracking-tight text-white/80 md:flex"
              aria-live="off"
            >
              Philadelphia
              <span
                aria-hidden
                className="mx-2 inline-block h-[3px] w-[3px] rounded-full bg-white"
              />
              EST
              <span className="ml-2 tabular-nums">{time ?? "—"}</span>
            </p>

            <div
              className="flex shrink-0 items-center gap-1 md:min-w-[10rem] md:justify-end md:gap-1"
              role="group"
              aria-label="Language"
            >
              {LANG_OPTIONS.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLanguage(code);
                  }}
                  className={[
                    "cursor-pointer px-1.5 py-1 tracking-wide transition-opacity duration-200 md:px-2",
                    language === code
                      ? "text-white underline underline-offset-4"
                      : "text-white/40 hover:text-white/75",
                  ].join(" ")}
                  aria-pressed={language === code}
                  aria-label={`Language: ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Non-blended overlay — hit target, red hover, count badge (store only) */}
      {showBag ? (
        <div
          data-site-status-bar
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[10051] font-swiss transition-opacity duration-300"
        >
          <div className={CHROME_PAD}>
            <div className={BAG_SLOT_CLASS}>
              <button
                type="button"
                aria-label={count > 0 ? `Bag, ${count} items` : "Bag"}
                onClick={goBag}
                onMouseEnter={() => setBagHovered(true)}
                onMouseLeave={() => setBagHovered(false)}
                className="pointer-events-auto absolute inset-0 z-20 cursor-pointer"
              />

              {bagHovered ? (
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full text-brand-red"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--brand-red) 22%, transparent)",
                  }}
                  aria-hidden
                >
                  <BagIcon className={BAG_ICON_CLASS} />
                </div>
              ) : null}

              {showBadge ? (
                <span
                  className="pointer-events-none absolute top-1 right-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem] font-medium leading-none text-white md:top-1.5 md:right-1.5 md:h-[1.375rem] md:min-w-[1.375rem] md:text-[0.7rem]"
                  style={{ backgroundColor: BAG_RED }}
                >
                  {badgeLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

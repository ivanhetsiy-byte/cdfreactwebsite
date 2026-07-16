"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

import { MissionStatement } from "@/components/sections/mission-statement";
import { useLanguage } from "@/context/LanguageContext";
import { getLenis, quinticEase } from "@/lib/lenis";

const iconClassName =
  "w-[32px] h-[32px] md:w-[38px] md:h-[38px] block shrink-0";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="insta-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="30%" stopColor="#DD2A7B" />
          <stop offset="60%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <path
        className="fill-current group-hover:fill-[url(#insta-gradient)]"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <Image
      src="/icons/tiktok%20logo.svg"
      alt="TikTok Logo"
      width={38}
      height={38}
      unoptimized
      className={`${iconClassName} text-[#666666] dark:text-[#888888] object-contain transition-all duration-200 cursor-pointer select-none swiss-no-select group-hover/tiktok:scale-105 dark:invert dark:opacity-70`}
      aria-hidden="true"
    />
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
}

const SOCIAL_LINKS: {
  label: string;
  href: string;
  icon: ReactNode;
  className: string;
}[] = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: <InstagramIcon />,
    className:
      "group text-[#666666] dark:text-[#888888] hover:text-[url(#insta-gradient)] transition-colors duration-200 cursor-pointer",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: <TikTokIcon />,
    className:
      "group/tiktok text-[#666666] dark:text-[#888888] transition-transform duration-200 cursor-pointer hover:[filter:drop-shadow(-1.5px_-1.5px_0_#FE0979)_drop-shadow(1.5px_1.5px_0_#00F2FE)]",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: <FacebookIcon />,
    className:
      "text-[#666666] dark:text-[#888888] hover:text-[#1877F2] dark:hover:text-[#1877F2] transition-colors duration-200 cursor-pointer",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: <YouTubeIcon />,
    className:
      "text-[#666666] dark:text-[#888888] hover:text-[#FF0000] dark:hover:text-[#FF0000] transition-colors duration-200 cursor-pointer",
  },
];

export default function Home() {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);

  // Stationary start at (0,0) behind the transition mask.
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    let rafId = 0;
    let attempts = 0;

    const freezeHero = () => {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        lenis.stop();
        return;
      }
      if (attempts++ < 120) {
        rafId = requestAnimationFrame(freezeHero);
      }
    };

    freezeHero();

    return () => cancelAnimationFrame(rafId);
  }, []);

  // 10ms scroll-intercept → unfreeze + luxury glide to #mission-section.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unlockTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastTouchY: number | null = null;
    let handedOff = false;

    const handleInitialScroll = (e: WheelEvent | TouchEvent) => {
      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      let deltaY = 0;
      if (e instanceof WheelEvent) {
        deltaY = e.deltaY;
      } else {
        const y = e.touches[0]?.clientY ?? 0;
        if (lastTouchY === null) {
          lastTouchY = y;
          e.preventDefault();
          return;
        }
        deltaY = lastTouchY - y;
        lastTouchY = y;
      }

      if (deltaY > 0) {
        e.preventDefault();
        if (handedOff) return;
        handedOff = true;

        window.removeEventListener("wheel", handleInitialScroll);
        window.removeEventListener("touchmove", handleInitialScroll);

        isAnimatingRef.current = true;
        setIsAnimating(true);

        timeoutId = setTimeout(() => {
          const lenis = getLenis();
          if (lenis) {
            lenis.start();

            lenis.scrollTo("#mission-section", {
              duration: 2.8,
              lock: true,
              offset: 120,
              easing: quinticEase,
            });

            unlockTimeoutId = setTimeout(() => {
              isAnimatingRef.current = false;
              setIsAnimating(false);
            }, 1600);
          } else {
            isAnimatingRef.current = false;
            setIsAnimating(false);
          }
        }, 10);
      } else {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleInitialScroll, { passive: false });
    window.addEventListener("touchmove", handleInitialScroll, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", handleInitialScroll);
      window.removeEventListener("touchmove", handleInitialScroll);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (unlockTimeoutId !== undefined) clearTimeout(unlockTimeoutId);
    };
  }, []);

  return (
    <main
      id="main-content"
      className="relative w-full min-h-screen bg-white text-black dark:bg-black dark:text-white pt-32 pb-24 px-6 md:p-10 md:pt-44 select-none swiss-no-select"
    >
      {isAnimating ? (
        <div
          className="fixed inset-0 z-[9999] cursor-default"
          aria-hidden="true"
        />
      ) : null}

      <section className="relative min-h-[calc(100dvh-11rem)] w-full bg-white text-black dark:bg-black dark:text-white md:min-h-[calc(100dvh-13rem)]">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <h1 className="font-swiss-compressed text-[12vw] leading-none font-black tracking-tighter uppercase md:text-[15vw] swiss-no-select">
            CDF
          </h1>
        </div>

        <footer
          className={`absolute bottom-0 left-0 z-20 w-full p-6 md:p-10 ${isAnimating ? "pointer-events-none" : ""}`}
        >
          <div className="mt-8 flex w-full translate-y-6 items-center justify-between">
            <p className="font-alt text-sm font-bold tracking-widest text-[#666666] uppercase md:text-base">
              {t.footer.enrollment}
            </p>
            <div
              className="flex items-center gap-6 md:gap-8"
              aria-label="Social media"
            >
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`${social.className} select-none swiss-no-select`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </section>

      <MissionStatement />
    </main>
  );
}

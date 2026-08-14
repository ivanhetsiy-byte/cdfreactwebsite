"use client";

import { useId } from "react";

const iconClassName =
  "w-[28px] h-[28px] md:w-[32px] md:h-[32px] block shrink-0";

function InstagramIcon({
  gradientId,
  sizeClass,
}: {
  gradientId: string;
  sizeClass: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={sizeClass}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="30%" stopColor="#DD2A7B" />
          <stop offset="60%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
      <style>{`
        a.group\\/instagram:hover path {
          fill: url(#${gradientId});
        }
      `}</style>
    </svg>
  );
}

function TikTokIcon({ sizeClass }: { sizeClass: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} transition-transform duration-200 group-hover/tiktok:scale-105`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"
      />
    </svg>
  );
}

function FacebookIcon({ sizeClass }: { sizeClass: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={sizeClass}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

function YouTubeIcon({ sizeClass }: { sizeClass: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={sizeClass}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
}

const SOCIAL_META = [
  {
    label: "Instagram",
    href:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
      "https://www.instagram.com/cdf_dance_school/",
    kind: "instagram" as const,
    className:
      "group/instagram text-[#666666] dark:text-[#888888] transition-colors duration-200 cursor-pointer",
  },
  {
    label: "TikTok",
    href:
      process.env.NEXT_PUBLIC_TIKTOK_URL ??
      "https://www.tiktok.com/@childancefactory",
    kind: "tiktok" as const,
    className:
      "group/tiktok text-[#666666] dark:text-[#888888] transition-transform duration-200 cursor-pointer hover:[filter:drop-shadow(-1.5px_-1.5px_0_#FE0979)_drop-shadow(1.5px_1.5px_0_#00F2FE)]",
  },
  {
    label: "Facebook",
    href:
      process.env.NEXT_PUBLIC_FACEBOOK_URL ??
      "https://www.facebook.com/CDF.danceschool",
    kind: "facebook" as const,
    className:
      "text-[#666666] dark:text-[#888888] hover:text-[#1877F2] dark:hover:text-[#1877F2] transition-colors duration-200 cursor-pointer",
  },
  {
    label: "YouTube",
    href:
      process.env.NEXT_PUBLIC_YOUTUBE_URL ??
      "https://www.youtube.com/@childancefactory",
    kind: "youtube" as const,
    className:
      "text-[#666666] dark:text-[#888888] hover:text-[#FF0000] dark:hover:text-[#FF0000] transition-colors duration-200 cursor-pointer",
  },
];

type SocialLinksProps = {
  className?: string;
  iconGap?: string;
};

export function SocialLinks({
  className = "",
  iconGap = "gap-5 md:gap-6",
}: SocialLinksProps) {
  const reactId = useId().replace(/:/g, "");
  const gradientId = `insta-gradient-${reactId}`;

  return (
    <div
      className={`flex items-center ${iconGap} ${className}`}
      aria-label="Social media"
    >
      {SOCIAL_META.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className={`${social.className} select-none swiss-no-select`}
        >
          {social.kind === "instagram" ? (
            <InstagramIcon gradientId={gradientId} sizeClass={iconClassName} />
          ) : null}
          {social.kind === "tiktok" ? (
            <TikTokIcon sizeClass={iconClassName} />
          ) : null}
          {social.kind === "facebook" ? (
            <FacebookIcon sizeClass={iconClassName} />
          ) : null}
          {social.kind === "youtube" ? (
            <YouTubeIcon sizeClass={iconClassName} />
          ) : null}
        </a>
      ))}
    </div>
  );
}
